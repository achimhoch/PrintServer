"use strict";

const config = require("config");

//----------------------------------------------------------
// Infrastruktur
//----------------------------------------------------------

const EventBus = require("./core/events/EventBus");
const Scheduler = require("./core/managers/Scheduler");
const Monitor = require("./core/monitor/Monitor");
const Discovery = require("./core/discovery/Discovery");

//----------------------------------------------------------
// Datenbank
//----------------------------------------------------------

//const Sequelize = require("./core/database/Sequelize");
const db = require("./core/database");

//----------------------------------------------------------
// Repositorys
//----------------------------------------------------------

const PrinterRepository = require("./core/repositorys/PrinterRepository");
const QueueRepository = require("./core/repositorys/QueueRepository");
const JobRepository = require("./core/repositorys/JobRepository");

//----------------------------------------------------------
// Manager
//----------------------------------------------------------

const PrinterManager = require("./core/managers/PrinterManager");
const QueueManager = require("./core/managers/QueueManager");
const JobManager = require("./core/managers/JobManager");

//----------------------------------------------------------
// Driver
//----------------------------------------------------------

const DriverRegistry = require("./core/drivers/DriverRegistry");

//----------------------------------------------------------
// Server
//----------------------------------------------------------

const ExpressServer = require("./web/ExpressServer");
const SocketServer = require("./web/SocketServer");

class Bootstrap {

    constructor() {

        this.config = config;

    }

    //----------------------------------------------------------
    // Initialisieren
    //----------------------------------------------------------

    async initialize() {

        //------------------------------------------------------
        // EventBus
        //------------------------------------------------------

        this.eventBus = new EventBus();

        //------------------------------------------------------
        // Datenbank
        //------------------------------------------------------

        //this.database = new Sequelize();

        //await this.database.connect();
        await db.sequelize.authenticate();
        
        console.log("✓ MySQL verbunden");

        //
        // Nur in Entwicklung!
        //
        if (this.config.get("database.sync")) {

            await db.sequelize.sync();

            console.log("✓ Datenbankschema synchronisiert"); 

        }

        //------------------------------------------------------
        // Repositorys
        //------------------------------------------------------

        this.printerRepository = new PrinterRepository(
            this.database
        );

        this.queueRepository = new QueueRepository(
            this.database
        );

        this.jobRepository = new JobRepository(
            this.database
        );

        //------------------------------------------------------
        // Treiber
        //------------------------------------------------------

        this.driverRegistry = new DriverRegistry(
            this.eventBus
        );

        this.driverRegistry.load();

        //------------------------------------------------------
        // Manager
        //------------------------------------------------------

        this.printerManager = new PrinterManager(

            this.printerRepository,

            this.driverRegistry,

            this.eventBus

        );

        this.queueManager = new QueueManager(

            this.queueRepository,

            this.eventBus

        );

        this.jobManager = new JobManager(

            this.jobRepository,

            this.eventBus

        );

        //------------------------------------------------------
        // Discovery
        //------------------------------------------------------

        this.discovery = new Discovery(

            this.printerManager,

            this.eventBus,

            config.get("discovery")

        );

        this.discovery.load();

        //------------------------------------------------------
        // Monitor
        //------------------------------------------------------

        this.monitor = new Monitor(

            this.printerManager,

            this.eventBus,

            config.get("monitor")

        );

        //------------------------------------------------------
        // Scheduler
        //------------------------------------------------------

        this.scheduler = new Scheduler(

            this.jobManager,

            this.queueManager,

            this.printerManager,

            this.eventBus,

            config.get("scheduler")

        );

        //------------------------------------------------------
        // Webserver
        //------------------------------------------------------

        this.web = new ExpressServer(this);

        await this.web.initialize();

        //------------------------------------------------------
        // Socket.IO
        //------------------------------------------------------

        this.socket = new SocketServer(

            this.web.server,

            this.eventBus,

            config.get("socket")

        );

    }

    //----------------------------------------------------------
    // Start
    //----------------------------------------------------------

    async start() {

        await this.discovery.start();

        await this.monitor.start();

        await this.scheduler.start();

        await this.web.start();

        this.socket.start();

        this.eventBus.publish(

            "applicationStarted"

        );

        console.log("PrintServer gestartet.");

    }

    //----------------------------------------------------------
    // Stop
    //----------------------------------------------------------

    async stop() {

        this.eventBus.publish(

            "applicationStopping"

        );

        await this.scheduler.stop();

        await this.discovery.stop();

        await this.monitor.stop();

        await this.web.stop();

        this.socket.stop();

        await this.database.disconnect();

        this.eventBus.publish(

            "applicationStopped"

        );

        console.log("PrintServer beendet.");

    }

}

module.exports = Bootstrap;