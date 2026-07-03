"use strict";
const http = require('http');
const express = require('express');
const path = require('path');

//Eventbus
const EventBus = require("./core/events/EventBus");

//Manager
const PrinterManager = require("./core/managers/PrinterManager");
const QueueManager = require("./core/managers/OueueManager");
const JobManager = require("./core/managers/JobManager");
const Scheduler = require("./core/managers/Scheduler");
const Monitor = require("./core/monitor/Monitor");

//Repositorys
const PrinterRepository = require("./core/repositorys/PrinterRepository");

//Discovery
const Discovery = require("./core/discovery/Discovery");
const MdnsProvider = require("./core/discovery/provider/MdnsProvider");
const IppScanProvider = require("./core/discovery/provider/IppScanProvider");
const StaticProvider = require("./core/discovery/provider/StaticProvider");

//Driver
const DriverRegistry = require("./core/drivers/DriverRegistry");
const IppDriver = require("./core/drivers/IppDriver");

//models
const Printer = require("./core/models/Printer");

//Server
const SocketServer = require("./websocket/SocketServer");
const ExpressServer = require("./api/ExpressServer");

class BootStrap {
    constructor() {
        this.config = require("./config/default.json"); 
    }

    async start() {
        this.printBanner();
        await this.createCore();
        await this.createDrivers();
        await this.createDiscovery();
        await this.createWebServer();
        this.registerEvents();
        await this.discovery.start();
        this.scheduler.start();
        this.monitor.start();

        console.log("");
        console.log("==========================");
        console.log("Druckserver gestartet");
        console.log("==========================");
        console.log(`HTTP       : ${this.config.http.port}`);
        console.log("Socket.io  : aktiv");
        console.log("Discovery  : aktiv");
        console.log("Monitor    : aktiv");
        console.log("");

    }
    //core
    async createCore() {
        this.printerRepository = new PrinterRepository();
        this.printerManager = new PrinterManager(this.printerRepository, EventBus);  
        this.queueManager = new QueueManager();
        this.jobManager = new JobManager();
        this.scheduler = new Scheduler(
            this.printerManager,
            this.queueManager,
            this.jobManager
        );  
        this.monitor = new Monitor(this.printerManager, EventBus);
    }

    //drivers
    async createDrivers() {
        this.driverRegistry = new DriverRegistry();
        this.driverRegistry.register("ipp", IppDriver);
    }

    //discovery
    async createDiscovery() {
        this.discovery = new Discovery(EventBus);
        this.discovery.register(new MdnsProvider());
        this.discovery.register(new IppScanProvider({networks: this.config.discovery.networks}));
        this.discovery.register(new StaticProvider([]));
    }

    //webserver
    async createWebServer() {
        this.app = express();
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(express.static(path.join(__dirname, "web/public")));
        this.httpServer = http.createServer(this.app);
        this.api = new ExpressServer(this.app, EventBus, this.printerManager, this.jobManager, this.queueManager);
        this.socket = new SocketServer(this.httpServer, EventBus);
        this.httpServer.listen(this.config.http.port, () => {
            console.log(`Http-Server läuft auf Port ${this.config.http.port}`);
        });
    }

    registerEvents() {
        this.discovery.on("printerFound", (info) => {
            if (this.printerManager.has(info.id)) {
                return;
            }
            const Driver = this.driverRegistry.get(info.protocol || "ipp");
            const printer = new Printer({
                ...info,
                driver: new Driver(info)
            });
            this.printerManager.add(printer);
        });

        this.discovery.on("printerUpdated", (info) => {
            this.printerManager.update(info.id, info);
        });

        this.discovery.on("printerLost", (info) => {
            this.printerManager.remove(info.id);
        });
    }

    //Banner
    printBanner() {
        console.clear();
        console.log("");
        console.log("======================");
        console.log("Node.js Print Server");
        console.log("======================");
        console.log("");
    }
}

module.exports = BootStrap;