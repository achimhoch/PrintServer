"use strict";
 
const fs = require('fs');
const path = require('path');


class DriverRegistry {

    constructor(eventBus, options = {}) {

        this.drivers = new Map();
        this.eventBus = eventBus;
        this.options = {
            path: path.join(__dirname),
            drivers: [],
            ...options
        };

        this.drivers = new Map();

    }
    //----------------------------------------------------------
    //alle Treiber laden
    //----------------------------------------------------------
    load() {
        if (this.options.drivers.length > 0) {
            for (const name of this.options.drivers) {
                this.loadDriver(name);
            }

            return;
        }

        const files = fs.readFileSync(this.options.path);
        for (const file of files) {
            if (!file.endsWith("Driver.js") || file === "DriverRegistry.js") {
                continue;
            }

            this.loadDriver(file);
        }
    }
    //----------------------------------------------------------
    loadDriver(file) {
        const filename = file.endsWith(".js") ? file : `${file}.js`;
        const Driver = require(path.join(this.options.path, filename));
        const driver = new Driver();
        const protocol = (driver.protocol || filename.replace("Driver.js", "")).toLowerCase();
        this.drivers.set(protocol, driver);
        this.eventBus.publish("driverLoaded", {protocol, driver: driver.constructor.name});
    }

    //----------------------------------------------------------
    // Registrierung
    //----------------------------------------------------------

    register(name, driverClass) {

        if (!name)
            throw new Error("Driver benötigt einen Namen.");

        if (!driverClass)
            throw new Error(`Treiber '${name}' ist ungültig.`);

        this.drivers.set(
            name.toLowerCase(),
            driverClass
        );

        console.log(`[Driver] registriert: ${name}`);

    }

    unregister(name) {

        return this.drivers.delete(
            name.toLowerCase()
        );

    }

    //----------------------------------------------------------
    // Abfrage
    //----------------------------------------------------------

    has(name) {

        return this.drivers.has(
            name.toLowerCase()
        );

    }

    get(name) {

        const driver = this.drivers.get(
            name.toLowerCase()
        );

        if (!driver) {

            throw new Error(

                `Treiber '${name}' wurde nicht registriert.`

            );

        }

        return driver;

    }

    create(name, options = {}) {

        const Driver = this.get(name);

        return new Driver(options);

    }

    //----------------------------------------------------------
    // Informationen
    //----------------------------------------------------------

    list() {

        return [...this.drivers.keys()];

    }

    entries() {

        return [...this.drivers.entries()];

    }

    count() {

        return this.drivers.size;

    }

    clear() {

        this.drivers.clear();

    }

    stats() {

        return {

            drivers: this.count(),

            names: this.list()

        };

    }

}

module.exports = DriverRegistry;