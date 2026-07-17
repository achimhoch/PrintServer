"use strict";

const config = require("config");

//----------------------------------------------------------
// Infrastruktur
//----------------------------------------------------------

const EventBus = require("./core/events/EventBus");

//----------------------------------------------------------
// Datenbank
//----------------------------------------------------------

const database = require("./core/database");

//----------------------------------------------------------
// Repositorys
//----------------------------------------------------------

const PrinterRepository = require("./core/repositories/PrinterRepository");
const QueueRepository = require("./core/repositories/QueueRepository");
const JobRepository = require("./core/repositories/JobRepository");

//----------------------------------------------------------
// Services
//----------------------------------------------------------

const PrinterService = require("./core/services/PrinterService");
const QueueService = require("./core/services/QueueService");
const JobService = require("./core/services/JobService");

//----------------------------------------------------------
// Manager
//----------------------------------------------------------

const PrinterManager = require("./core/managers/PrinterManager");
const QueueManager = require("./core/managers/QueueManager");
const JobManager = require("./core/managers/JobManager");

const Scheduler = require("./core/managers/Scheduler");
const Monitor = require("./core/monitor/Monitor");

//----------------------------------------------------------
// Discovery
//----------------------------------------------------------

const Discovery = require("./core/discovery/Discovery");
const ProviderRegistry = require("./core/discovery/ProviderRegistry");

//const MdnsProvider = require("./core/discovery/providers/MdnsProvider");
const IppScanProvider = require("./core/discovery/providers/IppScanProvider");
//const StaticProvider = require("./core/discovery/providers/StaticProvider");

//----------------------------------------------------------
// Driver
//----------------------------------------------------------

const DriverRegistry = require("./core/drivers/DriverRegistry");
const DriverFactory = require("./core/drivers/DriverFactory");

//----------------------------------------------------------
// Web
//----------------------------------------------------------

const ExpressServer = require("./web/ExpressServer");
const SocketServer = require("./web/SocketServer");

class Bootstrap {

    constructor() {

        this.config = config;

    }

    //----------------------------------------------------------

    async initialize() {

        //
        // EventBus
        //

        this.eventBus = new EventBus();

        //
        // Datenbank
        //

        await database.connect();

        this.database = database;

        //
        // Repositorys
        //

        this.printerRepository = new PrinterRepository(
            this.database.model("Printer")
        );

        this.queueRepository = new QueueRepository(
            this.database.model("Queue")
        );

        this.jobRepository = new JobRepository(
            this.database.model("Job")
        );

        //
        // Services
        //

        this.printerService = new PrinterService(
            this.printerRepository
        );

        this.queueService = new QueueService(
            this.queueRepository
        );

        this.jobService = new JobService(
            this.jobRepository
        );

        //
        // Driver
        //

        this.driverRegistry = new DriverRegistry();

        const drivers = DriverFactory.create(

            config.get("drivers")

        );

        for (const driver of drivers) {

            this.driverRegistry.register(driver);

        }

        await this.driverRegistry.initialize();

        //
        // Manager
        //

        this.printerManager = new PrinterManager(

            this.printerService,

            this.driverRegistry,

            this.eventBus

        );

        this.queueManager = new QueueManager(

            this.queueService,

            this.eventBus

        );

        this.jobManager = new JobManager(

            this.jobService,

            this.eventBus

        );

        //
        // Discovery
        //

        this.discovery = new Discovery(

            this.printerManager,

            this.eventBus,

            config.get("discovery")

        );

        await this.discovery.initialize();

        /*this.discovery.register(

            new MdnsProvider(

                config.get("discovery.mdns")

            )

        );*/

        this.discovery.register(

            new IppScanProvider(

                config.get("discovery.ipp")

            )

        );

        /*this.discovery.register(

            new StaticProvider(

                config.get("discovery.static")

            )

        );*/

        //
        // Monitor
        //

        this.monitor = new Monitor(

            this.printerManager,

            this.eventBus,

            config.get("monitor")

        );

        //
        // Scheduler
        //

        this.scheduler = new Scheduler(

            this.jobManager,

            this.queueManager,

            this.printerManager,

            this.eventBus,

            config.get("scheduler")

        );

        //
        // REST
        //

        this.web = new ExpressServer(

            this

        );

        await this.web.initialize();

        //
        // Socket.IO
        //

        this.socket = new SocketServer(

            this.web.server,

            this.eventBus,

            config.get("socket")

        );

    }

    //----------------------------------------------------------

    async start() {

        await this.driverRegistry.start();

        await this.discovery.start();

        await this.monitor.start();

        await this.scheduler.start();

        await this.web.start();

        this.socket.start();

        this.eventBus.publish(

            "application.started"

        );

        console.log(

            "PrintServer 2.0 gestartet."

        );

    }

    //----------------------------------------------------------

    async stop() {

        this.eventBus.publish(

            "application.stopping"

        );

        await this.scheduler.stop();

        await this.monitor.stop();

        await this.discovery.stop();

        await this.driverRegistry.stop();

        await this.web.stop();

        this.socket.stop();

        await this.database.disconnect();

        this.eventBus.publish(

            "application.stopped"

        );

    }

}

module.exports = Bootstrap;