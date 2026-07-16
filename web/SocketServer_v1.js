"use strict";

const { Server } = require("socket.io");
const config = require('config');

class SocketServer {

    constructor(httpServer, eventBus, options = {}) {

        this.eventBus = eventBus;

        this.clients = new Map();

        this.io = new Server(httpServer, {

            cors: {

                origin: "*",

                methods: ["GET", "POST"]

            },

            transports: [

                "websocket",

                "polling"

            ],

            ...options

        });

        this.registerSocketEvents();

        this.registerCoreEvents();

    }

    //----------------------------------------------------------
    // Socket.IO
    //----------------------------------------------------------

    registerSocketEvents() {

        this.io.on("connection", socket => {

            console.log(

                `[Socket] Client verbunden ${socket.id}`

            );

            this.clients.set(

                socket.id,

                socket

            );

            socket.emit(

                "server",

                {

                    connected: true,

                    timestamp: new Date()

                }

            );

            //--------------------------------------------------

            socket.on("disconnect", () => {

                this.clients.delete(socket.id);

                console.log(

                    `[Socket] Client getrennt ${socket.id}`

                );

            });

            //--------------------------------------------------

            socket.on("ping", () => {

                socket.emit(

                    "pong",

                    {

                        timestamp: Date.now()

                    }

                );

            });

            //--------------------------------------------------

            socket.on("subscribe", room => {

                socket.join(room);

            });

            //--------------------------------------------------

            socket.on("unsubscribe", room => {

                socket.leave(room);

            });

        });

    }

    //----------------------------------------------------------
    // EventBus
    //----------------------------------------------------------

    registerCoreEvents() {

        const events = [

            "printerFound",

            "printerAdded",

            "printerUpdated",

            "printerRemoved",

            "printerLost",

            "printerStatusChanged",

            "jobCreated",

            "jobQueued",

            "jobStarted",

            "jobProgress",

            "jobFinished",

            "jobCancelled",

            "jobError",

            "queueCreated",

            "queuePaused",

            "queueResumed",

            "queueCleared",

            "driverError",

            "monitorTick",

            "discoveryStarted",

            "discoveryStopped"

        ];

        for (const event of events) {

            this.eventBus.on(

                event,

                payload => {

                    this.broadcast(

                        event,

                        payload

                    );

                }

            );

        }

    }

    //----------------------------------------------------------
    // Broadcast
    //----------------------------------------------------------

    broadcast(event, payload) {

        this.io.emit(

            event,

            payload

        );

    }

    //----------------------------------------------------------
    // Einzelner Client
    //----------------------------------------------------------

    send(socketId, event, payload) {

        const socket = this.clients.get(socketId);

        if (!socket)
            return false;

        socket.emit(

            event,

            payload

        );

        return true;

    }

    //----------------------------------------------------------
    // Room
    //----------------------------------------------------------

    room(room, event, payload) {

        this.io.to(room).emit(

            event,

            payload

        );

    }

    //----------------------------------------------------------
    // Drucker
    //----------------------------------------------------------

    printer(printerId, event, payload) {

        this.room(

            `printer:${printerId}`,

            event,

            payload

        );

    }

    //----------------------------------------------------------
    // Queue
    //----------------------------------------------------------

    queue(queueId, event, payload) {

        this.room(

            `queue:${queueId}`,

            event,

            payload

        );

    }

    //----------------------------------------------------------
    // Job
    //----------------------------------------------------------

    job(jobId, event, payload) {

        this.room(

            `job:${jobId}`,

            event,

            payload

        );

    }

    //----------------------------------------------------------
    // Statistik
    //----------------------------------------------------------

    stats() {

        return {

            clients: this.clients.size,

            rooms: this.io.sockets.adapter.rooms.size

        };

    }

}

module.exports = SocketServer;