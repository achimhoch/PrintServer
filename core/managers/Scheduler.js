"use strict";

const { EventEmitter } = require("events");

class Scheduler extends EventEmitter {

    constructor(
        printerManager,
        queueManager,
        jobManager,
        options = {}
    ) {

        super();

        this.printerManager = printerManager;
        this.queueManager = queueManager;
        this.jobManager = jobManager;

        this.interval = options.interval || 1000;

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

        this.timer = setInterval(() => {

            this.tick();

        }, this.interval);

    }

    //----------------------------------------------------------
    // Stop
    //----------------------------------------------------------

    stop() {

        this.running = false;

        clearInterval(this.timer);

    }

    //----------------------------------------------------------
    // Scheduler-Zyklus
    //----------------------------------------------------------

    async tick() {

        for (const printer of this.printerManager) {

            await this.processPrinter(printer);

        }

    }

    //----------------------------------------------------------
    // Einen Drucker bearbeiten
    //----------------------------------------------------------

    async processPrinter(printer) {

        if (!printer.driver)
            return;

        if (printer.status !== "ONLINE")
            return;

        if (printer.busy)
            return;

        const job = this.queueManager.dequeue(
            printer.id
        );

        if (!job)
            return;

        printer.busy = true;

        try {

            this.jobManager.start(job.id);

            await printer.driver.print(job);

            this.jobManager.finish(job.id);

        }
        catch (err) {

            this.jobManager.error(
                job.id,
                err
            );

            this.emit(
                "schedulerError",
                {
                    printer,
                    job,
                    error: err
                }
            );

        }
        finally {

            printer.busy = false;

        }

    }

    //----------------------------------------------------------
    // Status
    //----------------------------------------------------------

    stats() {

        return {

            running: this.running,

            interval: this.interval

        };

    }

}

module.exports = Scheduler;