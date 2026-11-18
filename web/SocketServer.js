"use strict";

const { Server } = require("socket.io");
const config = require("config");
const logger = require("../core/logging/LogManager").getLogger("SocketServer");

class SocketServer {

    constructor(server, eventBus, options = {}, bootstrap = null) {

        this.server = server;

        this.eventBus = eventBus;

        this.options = options;

        this.bootstrap = bootstrap;

        this.printAppHandler = null;

        this.io = null;

        this.clients = new Set();

        this.initialized = false;

        this.started = false;

    }

    //----------------------------------------------------------
    // Initialisieren
    //----------------------------------------------------------

    initialize() {

        const socket = config.get("socket");

        this.io = new Server(

            this.server,

            {

                path: socket.path,

                cors: socket.cors

            }

        );

        this.registerEvents();

        this.registerEventBus();

        if (!this.bootstrap?.printAppRegistry && !this.bootstrap?.printAppService) {
            throw new Error("PrintAppSocketHandler konnte nicht initialisiert werden: " +
                "printAppRegistry oder printAppService fehlt im Bootstrap.");
        }

        const PrintAppSocketHandler = require("./socket/PrintAppSocketHandler");
        this.printAppHandler = new PrintAppSocketHandler(
            this.io,
            this.bootstrap.printAppRegistry,
            this.bootstrap.printAppService
        );
        this.printAppHandler.initialize();
        

        logger.info("Socket.IO-Namespace /printapp registriert");
        logger.info("SocketServer initialized");

    }

    //----------------------------------------------------------
    // Socket.IO
    //----------------------------------------------------------

    registerEvents() {

        this.io.on(

            "connection",

            socket => {

                this.clients.add(socket);

                logger.info(

                    `Socket connected (${socket.id})`

                );

                //--------------------------------------------------

                socket.emit(

                    "connected",

                    {

                        id: socket.id,

                        version: config.get(

                            "application.version"

                        )

                    }

                );

                //--------------------------------------------------

                socket.on(

                    "subscribe",

                    room => {

                        socket.join(room);

                    }

                );

                //--------------------------------------------------

                socket.on(

                    "unsubscribe",

                    room => {

                        socket.leave(room);

                    }

                );

                //--------------------------------------------------

                socket.on(

                    "disconnect",

                    () => {

                        this.clients.delete(socket);

                    }

                );

                logger.info(`Socket disconnected: ${socket.id}`);

            }

        );

    }

    //----------------------------------------------------------
    // EventBus
    //----------------------------------------------------------

    registerEventBus() {

        const events = [

            "printerDiscovered",
            "printerLost",
            "printerUpdated",
            "printerStatusChanged",

            "jobCreated",
            "jobStarted",
            "jobFinished",
            "jobFailed",

            "queueUpdated",

            "schedulerStarted",
            "schedulerStopped",

            "monitorStarted",
            "monitorStopped",
            "monitorTick",

            "applicationStarted",
            "applicationStopping",
            "printapp.status",
            "printapp.configuration.changed",
            "printapp.revoked",
            "discovery.scan.started",
            "discovery.scan.finished",
            "discovery.scan.error",

            "driverError",
            "driverRegistered"

        ];

        for (const event of events) {

            this.eventBus.subscribe(

                event,

                payload => {

                    this.emit(

                        event,

                        payload

                    );

                }

            );

        }

    }

    //----------------------------------------------------------
    // Nachricht senden
    //----------------------------------------------------------

    emit(event, payload) {

        if (!this.io)

            return;

        this.io.emit(

            event,

            payload

        );

    }

    //----------------------------------------------------------
    // Raum
    //----------------------------------------------------------

    emitRoom(room, event, payload) {

        if (!this.io)

            return;

        this.io.to(room).emit(

            event,

            payload

        );

    }

    //----------------------------------------------------------
    // Client
    //----------------------------------------------------------

    emitClient(id, event, payload) {

        if (!this.io)

            return;

        this.io.to(id).emit(

            event,

            payload

        );

    }

    //----------------------------------------------------------
    // Broadcast
    //----------------------------------------------------------

    broadcast(event, payload) {

        if (!this.io)

            return;

        this.io.emit(

            event,

            payload

        );

    }

    //----------------------------------------------------------
    // Start
    //----------------------------------------------------------

    async start() {

        if (!this.io) {

            this.initialize();

        }

        logger.info(

            "Socket.IO gestartet."

        );

    }

    //----------------------------------------------------------
    // Stop
    //----------------------------------------------------------

    async stop() {

        if (!this.io)

            return;

        await this.io.close();

        this.clients.clear();

        this.io = null;

        logger.info("SocketServer stopped");

    }

    //----------------------------------------------------------
    // Informationen
    //----------------------------------------------------------

    stats() {

        return {

            connectedClients: this.clients.size,

            running: this.io !== null

        };

    }

}

module.exports = SocketServer;