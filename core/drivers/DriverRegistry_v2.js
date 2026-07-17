"use strict";

const fs = require("fs");
const path = require("path");

class DriverRegistry {

    constructor(eventBus, options = {}) {

        this.eventBus = eventBus;

        this.options = {

            path: path.join(__dirname),

            drivers: [],

            ...options

        };

        this.drivers = new Map();

    }

    //----------------------------------------------------------
    // Alle Treiber laden
    //----------------------------------------------------------

    load() {

        if (this.options.drivers.length > 0) {

            for (const name of this.options.drivers) {

                this.loadDriver(name);

            }

            return;

        }

        const files = fs.readdirSync(this.options.path);

        for (const file of files) {

            if (
                !file.endsWith("Driver.js") ||
                file === "DriverRegistry.js"
            ) {
                continue;
            }

            this.loadDriver(file);

        }

    }

    //----------------------------------------------------------

    loadDriver(file) {

        const filename = file.endsWith(".js")
            ? file
            : `${file}.js`;

        const Driver = require(
            path.join(this.options.path, filename)
        );

        const driver = new Driver();

        const protocol =
            (driver.protocol || filename.replace("Driver.js", ""))
                .toLowerCase();

        this.drivers.set(protocol, driver);

        this.eventBus.publish("driverLoaded", {

            protocol,

            driver: driver.constructor.name

        });

    }

    //----------------------------------------------------------

    register(protocol, driver) {

        this.drivers.set(

            protocol.toLowerCase(),

            driver

        );

        this.eventBus.publish("driverRegistered", {

            protocol

        });

    }

    //----------------------------------------------------------

    unregister(protocol) {

        this.drivers.delete(

            protocol.toLowerCase()

        );

    }

    //----------------------------------------------------------

    get(protocol) {

        if (!protocol)
            return null;

        return this.drivers.get(

            protocol.toLowerCase()

        );

    }

    //----------------------------------------------------------

    has(protocol) {

        return this.drivers.has(

            protocol.toLowerCase()

        );

    }

    //----------------------------------------------------------

    getAll() {

        return [

            ...this.drivers.values()

        ];

    }

    //----------------------------------------------------------

    protocols() {

        return [

            ...this.drivers.keys()

        ];

    }

    //----------------------------------------------------------

    stats() {

        return {

            count: this.drivers.size,

            protocols: this.protocols()

        };

    }

}

module.exports = DriverRegistry;