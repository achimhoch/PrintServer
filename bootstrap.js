"use strict";

const config = require("config");

//----------------------------------------------------------
// Datenbank
//----------------------------------------------------------

const db = require("./database");

//----------------------------------------------------------
// Core
//----------------------------------------------------------

const EventBus = require("./core/EventBus");

const PrinterRepository = require("./core/repositories/PrinterRepository");
const QueueRepository = require("./core/repositories/QueueRepository");
const JobRepository = require("./core/repositories/JobRepository");

const PrinterManager = require("./core/managers/PrinterManager");
const QueueManager = require("./core/managers/QueueManager");
const JobManager = require("./core/managers/JobManager");

const Scheduler = require("./core/Scheduler");
const Monitor = require("./core/Monitor");
const Discovery = require("./core/discovery/Discovery");

//----------------------------------------------------------
// Netzwerk
//----------------------------------------------------------

const ExpressServer = require("./web/ExpressServer");
const SocketServer = require("./websocket/SocketServer");

//----------------------------------------------------------
// REST API
//----------------------------------------------------------

const PrinterRoutes = require("./web/routes/printers");
const QueueRoutes = require("./web/routes/queues");
const JobRoutes = require("./web/routes/jobs");
const DiscoveryRoutes = require("./web/routes/discovery");
const SystemRoutes = require("./web/routes/system");

class Bootstrap {

    constructor() {

        this.config = config;

    }

    //----------------------------------------------------------
    // Start
    //----------------------------------------------------------

    async start() {

        //------------------------------------------------------
        // Datenbank
        //------------------------------------------------------

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
        // EventBus
        //------------------------------------------------------

        this.eventBus = EventBus;

        //------------------------------------------------------
        // Repositorys
        //------------------------------------------------------

        this.printerRepository = new PrinterRepository();

        this.queueRepository = new QueueRepository();

        this.jobRepository = new JobRepository();

        //------------------------------------------------------
        // Manager
        //------------------------------------------------------

        this.printerManager = new PrinterManager(

            this.printerRepository,

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

            this.config.get("discovery")

        );

        //------------------------------------------------------
        // Monitor
        //------------------------------------------------------

        this.monitor = new Monitor(

            this.printerManager,

            this.eventBus,

            this.config.get("monitor")

        );

        //------------------------------------------------------
        // Scheduler
        //------------------------------------------------------

        this.scheduler = new Scheduler(

            this.jobManager,

            this.queueManager,

            this.printerManager,

            this.eventBus,

            this.config.get("scheduler")

        );

        //------------------------------------------------------
        // Express
        //------------------------------------------------------

        this.web = new ExpressServer(

            this.config.get("server")

        );

        this.web.static("./public");

        //------------------------------------------------------
        // REST
        //------------------------------------------------------

        this.web.use(

            "/api/printers",

            PrinterRoutes(this)

        );

        this.web.use(

            "/api/queues",

            QueueRoutes(this)

        );

        this.web.use(

            "/api/jobs",

            JobRoutes(this)

        );

        this.web.use(

            "/api/discovery",

            DiscoveryRoutes(this)

        );

        this.web.use(

            "/api/system",

            SystemRoutes(this)

        );

        //------------------------------------------------------
        // HTTP starten
        //------------------------------------------------------

        await this.web.start();

        //------------------------------------------------------
        // Socket.IO
        //------------------------------------------------------

        this.socket = new SocketServer(

            this.web.getServer(),

            this.eventBus

        );

        //------------------------------------------------------
        // Dienste starten
        //------------------------------------------------------

        await this.discovery.start();

        this.monitor.start();

        this.scheduler.start();

        console.log("");

        console.log("========================================");

        console.log(" Druckserver gestartet");

        console.log("========================================");

    }

    //----------------------------------------------------------
    // Stop
    //----------------------------------------------------------

    async stop() {

        this.scheduler.stop();

        this.monitor.stop();

        await this.discovery.stop();

        await this.web.stop();

        await db.sequelize.close();

        console.log("Druckserver beendet");

    }

}

module.exports = Bootstrap;