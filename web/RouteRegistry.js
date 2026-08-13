"use strict";

const logger = require("../core/logging/LogManager").getLogger("RouteRegistry");

//----------------------------------------------------------
// API-Routen
//----------------------------------------------------------

const PrinterRoutes = require("./api/routes/printers");
const JobRoutes = require("./api/routes/jobs");
const QueueRoutes = require("./api/routes/queues");
const DiscoveryRoutes = require("./api/routes/discovery");
const DriverRoutes = require("./api/routes/drivers");
const SchedulerRoutes = require("./api/routes/scheduler");
const MonitorRoutes = require("./api/routes/monitor");
const StatisticsRoutes = require("./api/routes/statistics");
const SystemRoutes = require("./api/routes/system");

//-------------------------------------------------------------

const PagesRoutes = require("../web/pages/router/PagesRoutes");
const QueuesRoutes = require("../web/pages/router/QueueRoutes");
const JobsRoutes = require("../web/pages/router/JobRoutes");
const LoginsRoutes = require("../web/pages/router/LoginRoutes");
//-------------------------------------------------------------

class RouteRegistry {

    constructor(bootstrap) {

        this.bootstrap = bootstrap;

        this.routes = [];

    }

    //----------------------------------------------------------
    // Initialisieren
    //----------------------------------------------------------

    initialize() {

        this.routes = [

            {
                path: "/api/printers",
                router: new PrinterRoutes( 
                    this.bootstrap
                ).build()
            },

            {
                path: "/api/jobs",
                router: new JobRoutes(
                    this.bootstrap
                ).build()
            },

            {
                path: "/api/queues",
                router: new QueueRoutes(
                    this.bootstrap
                ).build()
            },

            /*{
                path: "/api/discovery",
                router: new DiscoveryRoutes(
                    this.bootstrap
                ).build()
            },

            {
                path: "/api/drivers",
                router: new DriverRoutes(
                    this.bootstrap
                ).build()
            },

            {
                path: "/api/scheduler",
                router: new SchedulerRoutes(
                    this.bootstrap
                ).build()
            },

            {
                path: "/api/monitor",
                router: new MonitorRoutes(
                    this.bootstrap
                ).build()
            },

            {
                path: "/api/statistics",
                router: new StatisticsRoutes(
                    this.bootstrap
                ).build()
            },

            {
                path: "/api/system",
                router: new SystemRoutes(
                    this.bootstrap
                ).build()
            }*/

            {
                path: "/admin/printers",
                router: new PagesRoutes(this.bootstrap).build()
            },

            {
                path: "/dmin/queues",
                router: new QueuesRoutes(this.bootstrap).build()
            },

            {
                path: "/admin/jobs",
                router: new JobsRoutes(this.bootstrap).build()
            }, 
            
            {
                path: "/login",
                router: new LoginsRoutes(this.bootstrap).build()
            }

        ];

    }

    //----------------------------------------------------------
    // Registrieren
    //----------------------------------------------------------

    register(app) {

        if (this.routes.length === 0) {

            this.initialize();

        }

        for (const route of this.routes) {

            app.use(

                route.path,

                route.router

            );

            logger.info(

                `Route registered: ${route.path}`

            );

        }

    }

    //----------------------------------------------------------
    // Route hinzufügen
    //----------------------------------------------------------

    add(path, router) {

        this.routes.push({

            path,

            router

        });

        logger.info("Route added");

    }

    //----------------------------------------------------------
    // Route entfernen
    //----------------------------------------------------------

    remove(path) {

        this.routes = this.routes.filter(

            route => route.path !== path

        );

        logger.info("Route deleted");

    }

    //----------------------------------------------------------
    // Route suchen
    //----------------------------------------------------------

    get(path) {

        return this.routes.find(

            route => route.path === path

        );

    }

    //----------------------------------------------------------
    // Alle Routen
    //----------------------------------------------------------

    list() {

        return this.routes.map(

            route => ({

                path: route.path

            })

        );

    }

}

module.exports = RouteRegistry;