"use strict";

class DriverRegistry {

    constructor() {

        this.drivers = new Map();

    }

    //----------------------------------------------------------

    register(driver) {

        this.drivers.set(

            driver.name,

            driver

        );

        return driver;

    }

    //----------------------------------------------------------

    unregister(name) {

        this.drivers.delete(name);

    }

    //----------------------------------------------------------

    get(name) {

        return this.drivers.get(name);

    }

    //----------------------------------------------------------

    all() {

        return [

            ...this.drivers.values()

        ];

    }

    //----------------------------------------------------------

    findDriver(printer) {

        for (const driver of this.drivers.values()) {

            if (

                driver.enabled &&

                driver.supports(printer)

            ) {

                return driver;

            }

        }

        return null;

    }

    //----------------------------------------------------------

    async print(printer, job) {

        const driver = this.findDriver(

            printer

        );

        if (!driver)

            throw new Error(

                "No suitable driver."

            );

        return driver.print(

            printer,

            job

        );

    }

    //----------------------------------------------------------

    async initialize() {

        for (const driver of this.drivers.values()) {

            await driver.initialize();

        }

    }

    //----------------------------------------------------------

    async start() {

        for (const driver of this.drivers.values()) {

            await driver.start();

        }

    }

    //----------------------------------------------------------

    async stop() {

        for (const driver of this.drivers.values()) {

            await driver.stop();

        }

    }

    //----------------------------------------------------------

    statistics() {

        return this.all().map(

            driver => driver.statistics()

        );

    }

}

module.exports = DriverRegistry;