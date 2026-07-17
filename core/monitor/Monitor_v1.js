"use strict";

const { EventEmitter } = require("events"); 

class Monitor extends EventEmitter {

    constructor(
        printerManager,
        eventBus,
        options = {}
    ) {

        super();

        this.printerManager = printerManager;

        this.eventBus = eventBus;

        this.interval = options.interval || 15000;

        this.timer = null;

        this.running = false;

    }

    //----------------------------------------------------------
    // Start
    //----------------------------------------------------------

    start() {

        if (this.running)
            return;

        this.running = true;

        this.eventBus.publish("monitorStarted", {interval: this.interval});

        this.tick();

        this.timer = setInterval(

            () => this.tick(),

            this.interval

        );

        

    }

    //----------------------------------------------------------
    // Stop
    //----------------------------------------------------------

    stop() {

        if (!this.running) return;

        clearInterval(this.timer);

        this.running = false;

        this.eventBus.publish("monitorStopped", {});
    }

    //----------------------------------------------------------
    // Zyklus
    //----------------------------------------------------------

    async tick() {

        this.eventBus.publish(

            "monitorTick",

            {

                timestamp: new Date()

            }

        );

        const tasks = [];

        const printers = await this.printerManager.all();

        //for (const printer of this.printerManager) {
        for (const printer of printers) {

            tasks.push(

                this.updatePrinter(printer)

            );

        }

        await Promise.allSettled(tasks);

    }

    //----------------------------------------------------------
    // Einen Drucker aktualisieren
    //----------------------------------------------------------

    async updatePrinter(printer) {

        if (!printer.driver)
            return;

        try {

            const info = await printer.driver.update();

            if (!info)
                return;

            await this.printerManager.update(printer.id, info);

            if (info.status) {

                await this.printerManager.setStatus(printer.id, info.status);

            }

            printer.touch();

            this.eventBus.publish("printerActive", printer);

        }
        catch (err) {

            await this.printerManager.setStatus(printer.id, "OFFLINE");

            this.eventBus.publish("driverError", {printer, error: err});

        }

    }

    async refreshAll() {
        await this.tick();
    }

    //----------------------------------------------------------
    // Status
    //----------------------------------------------------------

    isRunning() {

        return this.running;

    }

    async stats() {

        /*return {

            running: this.running,

            interval: this.interval,

            printers: this.printerManager.all().length

        };*/

        const printers = await this.printerManager.stats();

        return {

            running: this.running,

            interval: this.interval,

            printers

        };
    }

}

module.exports = Monitor;