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
const LogRoutes = require("./api/routes/logs"); 

//admin--------------------------------------------------------

const PagesRoutes = require("../web/pages/router/admin/PagesRoutes");
const QueuesRoutes = require("../web/pages/router/admin/QueueRoutes");
const JobsRoutes = require("../web/pages/router/admin/JobRoutes");
const LogsRoutes = require("../web/pages/router/admin/LogRoutes");
const DiscoveryRoute = require("../web/pages/router/admin/ScanRoute");

//Main--------------------------------------------------------

const MainRoute = require("./pages/router/HomeRoutes"); 

//Auth--------------------------------------------------------
const AuthRoutes = require("./api/routes/auth");
//------------------------------------------------------------

class RouteRegistry {

    constructor(bootstrap) {

        this.bootstrap = bootstrap;

        this.routes = [];

        this.initialized = false;

        this.registered = false;

    }

    //----------------------------------------------------------
    // Initialisieren
    //----------------------------------------------------------

    initialize() {

        if (this.initialized) {
            return;
        }

        this.routes = [

        //API-------------------------------------------------------------
           
        //Public Api------------------------------------------------------
            {
                path: "/login",
                router: new AuthRoutes(this.bootstrap).build(),
                public: true,
                type: "web"
            },

            {   
                path: "api/auth",
                router: new AuthRoutes(this.bootstrap).build(),
                public: true,
                type: "api"
            },
        //Geschützte APi--------------------------------------------------

            {
                path: "/api/printers",
                router: new PrinterRoutes( this.bootstrap).build(),
                public: false,
                type: "api"
            },

            {
                path: "/api/jobs",
                router: new JobRoutes(this.bootstrap).build(),
                public: false,
                type: "api"
            },

            {
                path: "/api/queues",
                router: new QueueRoutes(this.bootstrap).build(),
                public: false,
                type: "api"
            },

            {
                path: "/api/discovery",
                router: new DiscoveryRoutes(this.bootstrap).build(),
                public: false,
                type: "api"
            },

            /*{
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
                path: "/api/logs",
                router: new LogRoutes(this.bootstrap).build(),
                public: false,
                type: "api",
                
            },

        // Admin-Routen-----------------------------------------------------
        //Geschützte Admin-Routen
            {
                path: "/admin/printers",
                router: new PagesRoutes(this.bootstrap).build(),
                public: false,
                type: "web"
            },

            {
                path: "/admin/queues",
                router: new QueuesRoutes(this.bootstrap).build(),
                public: false,
                type: "web"
            },

            {
                path: "/admin/jobs",
                router: new JobsRoutes(this.bootstrap).build(),
                public: false,
                type: "web"
            }, 

            {
                path: "/admin/logs",
                router: new LogsRoutes(this.bootstrap).build(),
                public: false,
                type: "web"
            },

            {
                path: "/admin/discovery",
                router: new DiscoveryRoute(this.bootstrap).build(),
                public: false,
                type: "web"
            },
        //Login--------------------------------------------------    
            {
                path: "/",
                router: new MainRoute(this.bootstrap).build(),
                public: false,
                type: "web"
            }

        ];

        this.initialized = true;

        logger.info(`RouteRegistry initialized: ${this.routes.length} routes`);

    }

    //----------------------------------------------------------
    // Registrieren
    //----------------------------------------------------------

    register(app) {

        if (this.routes.length === 0) {

            this.initialize();

        }

        for (const route of this.routes) { 
            //console.log(route);
            if (!route.router) {
                logger.error(`Falscher Router für Route ${route.path}`);
                continue;
            }

            //Public Route-------------------------------------------------
            if (route.public === true) {
                app.use(

                    route.path,

                    route.router

                );

                logger.info(

                    `Route registered: ${route.path}`

                );

                continue;

            }

            //Auth Middleware---------------------------------------------
            const middleware = [];

            if (this.bootstrap.authMiddleware) {
                middleware.push(this.bootstrap.authMiddleware.authenticate());

                if (route.type === "web") {
                    middleware.push(this.bootstrap.authMiddleware.requireWebAuth());
                } else {
                    middleware.push(this.bootstrap.authMiddleware.requireAuth());
                }

                //Rollen--------------------------------------------------

                if (Array.isArray(route.roles) && route.roles.length > 0) {
                    middleware.push(this.bootstrap.authMiddleware.requireRole(...route.roles));
                }
            }

            // Route registrieren-----------------------------------------
            app.use(
                route.path,
                ...middleware,
                route.router
            );

            logger.info(`Geschützte Routen registiert: ${route.path}`);

        }

        this.registered = true;

    }

    //----------------------------------------------------------
    // Route hinzufügen
    //----------------------------------------------------------

    add(path, router, options = {}) {

        const route = {

            path,
            router,
            public: options.public === true,
            type: options.type || "api",
            roles: Array.isArray(options.roles) ? options.roles : []

        };

        this.routes.push(route);

        logger.info("Route added");

        return route;

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

                path: route.path,
                public: route.public === true,
                type: route.type || "api",
                roles: route.roles || []

            })

        );

    }

}

module.exports = RouteRegistry;