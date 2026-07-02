"use strict";

class DriverRegistry {

    constructor() {

        this.drivers = new Map();

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