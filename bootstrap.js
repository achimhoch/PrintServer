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
        this.printerManager = new PrinterManager();
        this.queueManager = new QueueManager();
        this.jobManager = new JobManager();
        this.scheduler = new Scheduler(
            this.printerManager,
            this.queueManager,
            this.jobManager
        );  
        this.monitor = new Monitor(this.printerManager);
    }
}