"use strict";

const express = require("express");

class RouteRegistry {

    constructor(app) {

        this.app = app;

        this.routes = [];

    }

    //----------------------------------------------------------
    // Route registrieren
    //----------------------------------------------------------

    register(prefix, route) {

        this.routes.push({

            prefix,

            route

        });

        return this;

    }

    //----------------------------------------------------------
    // Mehrere Routen registrieren
    //----------------------------------------------------------

    registerMany(routes = []) {

        for (const route of routes) {

            this.register(

                route.prefix,

                route.router

            );

        }

        return this;

    }

    //----------------------------------------------------------
    // Router einbinden
    //----------------------------------------------------------

    build(base = "/api") {

        const router = express.Router();

        for (const entry of this.routes) {

            const api =

                typeof entry.route.build === "function"

                    ? entry.route.build()

                    : entry.route.router || entry.route;

            router.use(

                entry.prefix,

                api

            );

        }

        this.app.use(

            base,

            router

        );

        return router;

    }

    //----------------------------------------------------------
    // Informationen
    //----------------------------------------------------------

    list() {

        return this.routes.map(route => ({

            prefix: route.prefix,

            router:

                route.route.constructor.name

        }));

    }

    //----------------------------------------------------------

    clear() {

        this.routes = [];

    }

}

module.exports = RouteRegistry;