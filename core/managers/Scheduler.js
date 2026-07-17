"use strict";

const EventEmitter = require("events");

class Scheduler extends EventEmitter {

    constructor(

        jobManager,

        queueManager,

        printerManager,

        eventBus,

        options = {}

    ) {

        super();

        this.jobManager = jobManager;

        this.queueManager = queueManager;

        this.printerManager = printerManager;

        this.eventBus = eventBus;

        this.options = {

            interval: 1000,

            maxParallelJobs: 4,

            ...options

        };

        this.timer = null;

        this.running = false;

        this.processing = 0;

    }

    //----------------------------------------------------------
    // Initialisieren
    //----------------------------------------------------------

    async initialize() {

    }

    //----------------------------------------------------------
    // Start
    //----------------------------------------------------------

    async start() {

        if (this.running)
            return;

        this.running = true;

        this.eventBus.publish(

            "scheduler.started"

        );

        this.timer = setInterval(

            () => {

                this.tick()

                    .catch(err => {

                        this.eventBus.publish(

                            "scheduler.error",

                            err

                        );

                    });

            },

            this.options.interval

        );

    }

    //----------------------------------------------------------
    // Stop
    //----------------------------------------------------------

    async stop() {

        if (!this.running)
            return;

        clearInterval(this.timer);

        this.timer = null;

        this.running = false;

        this.eventBus.publish(

            "scheduler.stopped"

        );

    }

    //----------------------------------------------------------
    // Scheduler-Zyklus
    //----------------------------------------------------------

    async tick() {

        if (!this.running)
            return;

        if (

            this.processing >=

            this.options.maxParallelJobs

        ) {

            return;

        }

        const printer =

            await this.findPrinter();

        if (!printer)
            return;

        const job =

            await this.queueManager.dequeue(

                printer.id

            );

        if (!job)
            return;

        this.processing++;

        this.processJob(

            printer,

            job

        )

        .finally(() => {

            this.processing--;

        });

    }

    //----------------------------------------------------------
    // Drucker auswählen
    //----------------------------------------------------------

    async findPrinter() {

        const printers =

            await this.printerManager.getIdle();

        if (!printers.length)
            return null;

        //
        // RoundRobin / Priorität später
        //

        return printers[0];

    }

    //----------------------------------------------------------
    // Druckjob ausführen
    //----------------------------------------------------------

    async processJob(

        printer,

        job

    ) {

        try {

            await this.jobManager.start(

                job.id

            );

            this.eventBus.publish(

                "job.started",

                job

            );

            await this.printerManager.print(

                printer.id,

                job

            );

            await this.jobManager.finish(

                job.id

            );

            this.eventBus.publish(

                "job.finished",

                job

            );

        }
        catch (err) {

            await this.jobManager.fail(

                job.id,

                err.message

            );

            this.eventBus.publish(

                "job.failed",

                {

                    job,

                    error: err

                }

            );

        }

    }

    //----------------------------------------------------------
    // Status
    //----------------------------------------------------------

    status() {

        return {

            running: this.running,

            processing: this.processing,

            interval: this.options.interval,

            maxParallelJobs:

                this.options.maxParallelJobs

        };

    }

}

module.exports = Scheduler;