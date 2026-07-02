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

        this.timer = setInterval(

            () => this.tick(),

            this.interval

        );

        this.tick();

    }

    //----------------------------------------------------------
    // Stop
    //----------------------------------------------------------

    stop() {

        this.running = false;

        clearInterval(this.timer);

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

        for (const printer of this.printerManager) {

            tasks.push(

                this.updatePrinter(printer)

            );

        }

        await Promise.allSettled(tasks);

    }

    //----------------------------------------------------------
    // Einen Drucker überwachen
    //----------------------------------------------------------

    async updatePrinter(printer) {

        if (!printer.driver)
            return;

        try {

            const info = await printer.driver.update();

            if (!info)
                return;

            this.printerManager.update(

                printer.id,

                info

            );

            if (info.status) {

                this.printerManager.setStatus(

                    printer.id,

                    info.status

                );

            }

        }
        catch (err) {

            this.printerManager.setStatus(

                printer.id,

                "OFFLINE"

            );

            this.eventBus.publish(

                "driverError",

                {

                    printer,

                    error: err

                }

            );

        }

    }

    //----------------------------------------------------------
    // Status
    //----------------------------------------------------------

    isRunning() {

        return this.running;

    }

    stats() {

        return {

            running: this.running,

            interval: this.interval,

            printers: this.printerManager.all().length

        };

    }

}

module.exports = Monitor;