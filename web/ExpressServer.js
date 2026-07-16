"use strict";

const express = require("express");
const http = require("http");
const path = require("path");
const compression = require("compression");
const helmet = require("helmet");
const cors = require("cors");
const config = require("config");

const middleware = require("./api/middleware");
const RouterRegistry = require("./api/routes/RouteRegistry");

// API-Routen
const PrinterRoutes = require("./api/routes/printers");
const jobRoutes = require("./api/routes/jobs");
const queueRoutes = require("./api/routes/queues");
const discoveryRoutes = require("./api/routes/discovery");
const schedulerRoutes = require("./api/routes/scheduler");
const driverRoutes = require("./api/routes/drivers");
const statisticsRoutes = require("./api/routes/statistics");
const systemRoutes = require("./api/routes/system");

class ExpressServer {

    constructor(bootstrap) {

        this.bootstrap = bootstrap;

        this.app = express();

        this.server = http.createServer(this.app);

        this.registry = new RouterRegistry(this.app);

    }

    //----------------------------------------------------------
    // Initialisieren
    //----------------------------------------------------------

    async initialize() {

        this.configureExpress();

        this.configureMiddleware();

        this.configureRoutes();

        this.configureErrorHandling();

    }

    //----------------------------------------------------------
    // Express konfigurieren
    //----------------------------------------------------------

    configureExpress() {
        const web = config.get("web")

        this.app.disable("x-powered-by");

        this.app.set("trust proxy", web.trustProxy);

        this.app.use(express.json({limit: web.body.jsonLimit}));

        this.app.use(express.urlencoded({extended: web.urlencodedExtended}));

    }

    //----------------------------------------------------------
    // Middleware
    //----------------------------------------------------------

    configureMiddleware() {

        const security = config.get("security");
        const web = config.get("web");

        if (security.helmet) {
            this.app.use(helmet());
        }

        if (security.compression) {
            this.app.use(compression());
        }

        if (web.cors.enabled) {
            this.app.use(cors({origin: web.cors.origin, credentials: true}));
        }

        this.app.use(middleware.RequestId());

        this.app.use(middleware.RequestLogger(this.bootstrap.eventBus));

        if (security.rateLimit.enabled) {
            this.app.use(middleware.RateLimiter({windowMs: security.rateLimit.windowMs, max: security.rateLimit.max}));
        }

        if (security.apiKey.enabled) {
            this.app.use(middleware.Authentication({enabled: true, apiKey: security.apiKey.key, header: security.apiKey.header}));
        }

    }

    //----------------------------------------------------------
    // API
    //----------------------------------------------------------

    configureRoutes() {

        this.app.get(

            "/",

            (req, res) => {

                res.json({

                    application: "Node Print Server",

                    version: "1.0.0",

                    status: "running"

                });

            }

        );

        //------------------------------------------------------
        //API registrieren
        //------------------------------------------------------

        this.registry.register("/printer", new PrinterRoutes(this.bootstrap));

        //------------------------------------------------------
        //API aktivieren
        //------------------------------------------------------

        this.registry.build();

        //------------------------------------------------------
        // Webclient
        //------------------------------------------------------

        this.app.use(express.static(path.resolve(config.get("web.public"))));

    }

    //----------------------------------------------------------
    // Fehlerbehandlung
    //----------------------------------------------------------

    configureErrorHandling() {

        this.app.use(middleware.NotFound);

        this.app.use(middleware.ErrorHandler);

    }

    //----------------------------------------------------------
    // Start
    //----------------------------------------------------------

    async start() {

        const web = config.get("web");

        return new Promise(resolve => {

            this.server.listen(

                web.port,

                web.host,

                () => {

                    console.log(

                        `ExpressServer listening on http://${web.host}:${web.port}`

                    );

                    resolve();

                }

            );

        });

    }

    //----------------------------------------------------------
    // Stop
    //----------------------------------------------------------

    async stop() {

        return new Promise(resolve => {

            this.server.close(resolve);

        });

    }

}

module.exports = ExpressServer;