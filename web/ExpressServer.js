"use strict";

const express = require("express");
const http = require("http");
const path = require("path");
const compression = require("compression");
const helmet = require("helmet");
const cors = require("cors");
const config = require("config");

const middleware = require("./api/middleware");

// API-Routen
const printerRoutes = require("./api/routes/printers");
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

        this.app.disable("x-powered-by");

        this.app.set(
            "trust proxy",
            config.get("server.trustProxy")
        );

        this.app.use(express.json({

            limit: "10mb"

        }));

        this.app.use(express.urlencoded({

            extended: true

        }));

    }

    //----------------------------------------------------------
    // Middleware
    //----------------------------------------------------------

    configureMiddleware() {

        this.app.use(helmet());

        this.app.use(compression());

        if (config.get("server.cors.enabled")) {

            this.app.use(

                cors({

                    origin: config.get("server.cors.origin"),

                    credentials: true

                })

            );

        }

        this.app.use(

            middleware.RequestId()

        );

        this.app.use(

            middleware.RequestLogger(

                this.bootstrap.eventBus

            )

        );

        this.app.use(

            middleware.RateLimiter({

                windowMs: 60000,

                max: 300

            })

        );

        this.app.use(

            middleware.Authentication({

                enabled: config.get("security.apiKey.enabled"),

                apiKey: config.get("security.apiKey.key")

            })

        );

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

        this.app.use(

            "/api/printers",

            printerRoutes(this.bootstrap)

        );

        this.app.use(

            "/api/jobs",

            jobRoutes(this.bootstrap)

        );

        this.app.use(

            "/api/queues",

            queueRoutes(this.bootstrap)

        );

        this.app.use(

            "/api/discovery",

            discoveryRoutes(this.bootstrap)

        );

        this.app.use(

            "/api/scheduler",

            schedulerRoutes(this.bootstrap)

        );

        this.app.use(

            "/api/drivers",

            driverRoutes(this.bootstrap)

        );

        this.app.use(

            "/api/statistics",

            statisticsRoutes(this.bootstrap)

        );

        this.app.use(

            "/api/system",

            systemRoutes(this.bootstrap)

        );

        //------------------------------------------------------
        // Webclient
        //------------------------------------------------------

        this.app.use(

            express.static(

                path.join(

                    process.cwd(),

                    "public"

                )

            )

        );

    }

    //----------------------------------------------------------
    // Fehlerbehandlung
    //----------------------------------------------------------

    configureErrorHandling() {

        this.app.use(

            middleware.NotFound

        );

        this.app.use(

            middleware.ErrorHandler

        );

    }

    //----------------------------------------------------------
    // Start
    //----------------------------------------------------------

    async start() {

        return new Promise(resolve => {

            const port = config.get("server.port");

            const host = config.get("server.host");

            this.server.listen(

                port,

                host,

                () => {

                    console.log(

                        `ExpressServer listening on http://${host}:${port}`

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