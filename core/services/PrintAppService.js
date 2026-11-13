"use strict";
const crypto = require("crypto");

class PrintAppService {
    constructor(repository, eventBus) {
        this.repository = repository;
        this.eventBus = eventBus;
    }
    hashKey(key) {
        return crypto.createHash("sha256").update(String(key)).digest("hex");
    }
    async authenticateApiKey(key) {
        if (!key) return null;
        return this.repository.findByKeyHash(this.hashKey(key));
    }
    async create(values) {
        if (!values || !values.userId || !values.name) throw new Error("name und userId sind erforderlich");
        const user = await this.repository.model.sequelize.models.User.findByPk(String(values.userId));
        if (!user) throw new Error("Der zugeordnete Benutzer existiert nicht in der Tabelle users");
        const queueId = values.queueId === undefined ? user.queueId : values.queueId;
        if (queueId !== null && queueId !== undefined) {
            const queue = await this.repository.model.sequelize.models.Queue.findByPk(queueId);
            if (!queue) throw new Error("Die zugeordnete Queue existiert nicht");
        }
        const apiKey = "pa_" + crypto.randomBytes(32).toString("base64url");
        const clientId = values.clientId || crypto.randomUUID();
        const record = await this.repository.create({
            clientId, name: values.name, userId: String(values.userId),
            queueId: queueId || null, apiKeyHash: this.hashKey(apiKey),
            enabled: true, status: "offline"
        });
        return { client: this.publicClient(record), apiKey };
    }
    publicClient(record) {
        const value = record.toJSON ? record.toJSON() : { ...record };
        delete value.apiKeyHash;
        return value;
    }
    async list() {
        const rows = await this.repository.list();
        return Promise.all(rows.map(async row => {
            const assignment = await this.repository.getAssignment(row);
            return { ...this.publicClient(row), username: assignment.user?.username || null,
                queueName: assignment.queue?.name || null,
                printerNames: assignment.printers.map(p => p.name) };
        }));
    }
    async get(id) {
        const row = await this.repository.findById(id);
        if (!row) return null;
        const a = await this.repository.getAssignment(row);
        return { ...this.publicClient(row), username: a.user?.username || null,
            queue: a.queue, printers: a.printers };
    }
    async updateAssignment(id, values = {}) {
        const row = await this.repository.findById(id);
        if (!row) return null;
        const patch = {};
        if (values.userId !== undefined) {
            const user = await this.repository.model.sequelize.models.User.findByPk(String(values.userId));
            if (!user) throw new Error("Benutzer nicht gefunden");
            patch.userId = String(values.userId);
            if (values.queueId === undefined) patch.queueId = user.queueId || null;
        }
        if (values.queueId !== undefined) {
            if (values.queueId !== null) {
                const queue = await this.repository.model.sequelize.models.Queue.findByPk(values.queueId);
                if (!queue) throw new Error("Queue nicht gefunden");
            }
            patch.queueId = values.queueId;
        }
        if (values.name !== undefined) patch.name = String(values.name).slice(0, 255);
        await row.update(patch);
        this.eventBus.publish("printapp.configuration.changed", { clientId: row.clientId });
        return this.publicClient(row);
    }
    async revoke(id) {
        const row = await this.repository.findById(id);
        if (!row) return false;
        await row.update({ enabled: false, status: "offline", revokedAt: new Date() });
        this.eventBus.publish("printapp.revoked", { clientId: row.clientId });
        return true;
    }
    async enable(id) {
        const row = await this.repository.findById(id);
        if (!row) return null;
        const apiKey = "pa_" + crypto.randomBytes(32).toString("base64url");
        await row.update({
            apiKeyHash: this.hashKey(apiKey),
            enabled: true,
            revokedAt: null,
            status: "offline"
        });
        return { client: this.publicClient(row), apiKey };
    }
    async getClientConfiguration(client) {
        const a = await this.repository.getAssignment(client);
        return {
            clientId: client.clientId,
            user: a.user ? { id: a.user.id, username: a.user.username } : null,
            queue: a.queue ? { id: a.queue.id, name: a.queue.name, enabled: a.queue.enabled, paused: a.queue.paused } : null,
            printers: a.printers.map(p => ({
                id: p.id, name: p.name, status: p.status, online: p.online,
                manufacturer: p.manufacturer, model: p.model
            }))
        };
    }
}
module.exports = PrintAppService;