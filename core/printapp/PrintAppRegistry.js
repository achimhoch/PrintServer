"use strict";
const logger = require("../logging/LogManager").getLogger("PrintAppRegistry");

class PrintAppRegistry {
    constructor(repository, service, eventBus, options = {}) {
        this.repository = repository;
        this.service = service;
        this.eventBus = eventBus;
        this.timeoutMs = options.timeoutMs || 90000;
        this.active = new Map();
        this.timer = null;
        this.eventBus.subscribe("printapp.revoked", payload => {
            const active = this.active.get(payload.clientId);
            if (active?.socket) active.socket.disconnect(true);
        });
        this.eventBus.subscribe("printapp.configuration.changed", payload => {
            this.pushConfiguration(payload.clientId).catch(error =>
                logger.error("PrintApp configuration push failed", error)
            );
        });
    }
    async pushConfiguration(clientId) {
        const active = this.active.get(clientId);
        if (!active?.socket) return;
        const client = await this.repository.findByClientId(clientId);
        if (client) {
            const configuration = await this.service.getClientConfiguration(client);
            active.socket.emit("printapp:config", configuration);
        }
    }
    async initialize() {
        await this.repository.markAllOffline();
        this.timer = setInterval(() => this.expireStale().catch(err => logger.error("PrintApp timeout check failed", err)), 15000);
        if (this.timer.unref) this.timer.unref();
    }
    async authenticate(apiKey, clientId) {
        const client = await this.service.authenticateApiKey(apiKey);
        if (!client || !client.enabled || client.revokedAt || client.clientId !== clientId) return null;
        return client;
    }
    async connect(socket, client, metadata = {}) {
        const old = this.active.get(client.clientId);
        if (old && old.socketId !== socket.id) {
            const oldSocket = socket.nsp?.sockets?.get(old.socketId);
            if (oldSocket) oldSocket.disconnect(true);
        }
        const now = new Date();
        await client.update({
            status: "online", lastSeen: now, registeredAt: client.registeredAt || now,
            hostname: metadata.hostname || client.hostname,
            platform: metadata.platform || client.platform,
            version: metadata.version || client.version,
            ipAddress: socket.handshake.address
        });
        this.active.set(client.clientId, { socketId: socket.id, lastSeen: now, socket });
        socket.data.printAppClient = client;
        const payload = { clientId: client.clientId, status: "online", lastSeen: now };
        this.eventBus.publish("printapp.status", payload);
        return this.service.getClientConfiguration(client);
    }
    async heartbeat(socket) {
        const client = socket.data.printAppClient;
        if (!client) return false;
        const now = new Date();
        const active = this.active.get(client.clientId);
        if (!active || active.socketId !== socket.id) return false;
        active.lastSeen = now;
        await client.update({ lastSeen: now, status: "online" });
        socket.emit("printapp:heartbeat:ack", { at: now.toISOString() });
        return true;
    }
    async disconnect(socket) {
        const client = socket.data.printAppClient;
        if (!client) return;
        const active = this.active.get(client.clientId);
        if (!active || active.socketId !== socket.id) return;
        this.active.delete(client.clientId);
        await client.update({ status: "offline" });
        this.eventBus.publish("printapp.status", {
            clientId: client.clientId, status: "offline", lastSeen: client.lastSeen
        });
    }
    async expireStale() {
        const cutoff = Date.now() - this.timeoutMs;
        for (const [clientId, state] of this.active) {
            if (state.lastSeen.getTime() >= cutoff) continue;
            this.active.delete(clientId);
            if (state.socket) state.socket.disconnect(true);
            const client = await this.repository.findByClientId(clientId);
            if (client) await client.update({ status: "offline" });
            this.eventBus.publish("printapp.status", { clientId, status: "offline", lastSeen: state.lastSeen });
        }
    }
    isOnline(clientId) { return this.active.has(clientId); }
    async stop() {
        if (this.timer) clearInterval(this.timer);
        this.timer = null;
        for (const [clientId] of this.active) {
            const client = await this.repository.findByClientId(clientId);
            if (client) await client.update({ status: "offline" });
        }
        this.active.clear();
    }
}
module.exports = PrintAppRegistry;