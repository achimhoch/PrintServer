"use strict";

const express = require("express");
const http = require("http");
const path = require("path");
const compression = require("compression");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");

class ExpressServer {

    constructor(config = {}) {

        this.config = config;

        this.port = config.port || 3000;

        this.host = config.host || "0.0.0.0";

        this.app = express();

        this.server = http.createServer(this.app);

        this.configure();

    }

    //----------------------------------------------------------
    // Express konfigurieren
    //----------------------------------------------------------

    configure() {

        this.app.disable("x-powered-by");

        this.app.use(helmet({

            contentSecurityPolicy: false

        }));

        this.app.use(cors());

        this.app.use(compression());

        this.app.use(express.json({

            limit: "100mb"

        }));

        this.app.use(express.urlencoded({

            extended: true

        }));

        this.app.use(morgan("dev"));

    }

    //----------------------------------------------------------
    // Statische Dateien
    //----------------------------------------------------------

    static(directory) {

        this.app.use(

            express.static(

                path.resolve(directory)

            )

        );

    }

    //----------------------------------------------------------
    // API registrieren
    //----------------------------------------------------------

    use(path, router) {

        this.app.use(path, router);

    }

    //----------------------------------------------------------
    // GET
    //----------------------------------------------------------

    get(path, handler) {

        this.app.get(path, handler);

    }

    //----------------------------------------------------------
    // POST
    //----------------------------------------------------------

    post(path, handler) {

        this.app.post(path, handler);

    }

    //----------------------------------------------------------
    // PUT
    //----------------------------------------------------------

    put(path, handler) {

        this.app.put(path, handler);

    }

    //----------------------------------------------------------
    // DELETE
    //----------------------------------------------------------

    delete(path, handler) {

        this.app.delete(path, handler);

    }

    //----------------------------------------------------------
    // HTTP-Server starten
    //----------------------------------------------------------

    async start() {

        return new Promise(resolve => {

            this.server.listen(

                this.port,

                this.host,

                () => {

                    console.log(

                        `HTTP Server läuft auf http://${this.host}:${this.port}`

                    );

                    resolve();

                }

            );

        });

    }

    //----------------------------------------------------------
    // HTTP-Server stoppen
    //----------------------------------------------------------

    async stop() {

        return new Promise(resolve => {

            this.server.close(resolve);

        });

    }

    //----------------------------------------------------------
    // Zugriff
    //----------------------------------------------------------

    getApp() {

        return this.app;

    }

    getServer() {

        return this.server;

    }

}

module.exports = ExpressServer;