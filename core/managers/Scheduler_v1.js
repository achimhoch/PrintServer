"use strict";

const { EventEmitter } = require("events");

class Scheduler extends EventEmitter {

    constructor(
        printerManager,
        queueManager,
        jobManager,
        eventBus,
        options = {}
    ) {

        super();

        //console.log(printerManager);

        this.printerManager = printerManager;
        this.queueManager = queueManager;
        this.jobManager = jobManager;
        this.eventBus = eventBus;
        this.interval = options.interval || 1000;
        this.maxParallelJobs = options.maxParallelJobs || 5;
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

        this.eventBus.publish("schedulerStarted", { interval: this.interval });

        this.timer = setInterval(() => {

            this.tick();

        }, this.interval);

    }

    //----------------------------------------------------------
    // Stop
    //----------------------------------------------------------

    stop() {

        if (!this.running) return;

        clearInterval(this.timer);

        this.running = false;

        this.eventBus.publish("schedulerStopped");
    }

    //----------------------------------------------------------
    // Scheduler-Zyklus
    //----------------------------------------------------------

    async tick() {
        //console.log(this.printerManager);
        this.eventBus.publish("schedulerTick", {timestamp: new Date()});

        const queues = await this.queueManager.findIdle();
        for (const queue of queues) {
            if (!queue.enabled) continue;
            if (queue.paused) continue;
            if (queue.processing) continue;

            await this.scheduledQueue(queue);
        }

        /*for (const printer of this.printerManager) {

            await this.processPrinter(printer);

        }*/

    }
    //----------------------------------------------------------
    //Warteschlange verarbeiten
    //----------------------------------------------------------
    async scheduledQueue(queue) {
        const printer = await this.printerManager.get(queue.printerId);

        if (!printer) return;
        if (!printer.online) return;
        if (printer.busy) return;

        const job = await this.jobManager.nextJob(queue.id);

        if (!job) return;

        await this.executeJob(printer, queue, job);
    }

    //----------------------------------------------------------
    //Druckauftrag starten
    //----------------------------------------------------------
    async executeJob(printer, queue, job) {
        try {

            queue.processing = true;
            queue.activeJob = job.id

            await this.queueManager.update(queue.id, {processing: true, activeJob: job.id, lastJobStarted: new Date()});

            await this.jobManager.update(job.id, {status: "PRINTING", startedAt: new Date()});

            await this.printerManager.setStatus(printer.id, "PRINTING");

            this.eventBus.publish("jobStarted", {printer, queue, job});

            //treiber
            await printer.driver.print(job);

            //erfolgreich
            await this.jobManager.update(job.id, {status: "COMPLETED", finishedAt: new Date()});

            await this.queueManager.update(queue.id, {processing: false, activeJob: null, completedJobs: queue.completedJobs + 1, queuedJobs: Math.max(0, queue.queuedJobs - 1), lastJobFinished: new Date()});

            await this.printerManager.setStatus(printer.id, "IDLE");

            this.eventBus.publish("jobFinished", {printer, queue, job});
        }
        catch (err) {
            await this.jobManager.update(
                job.id,
                {
                    status: "ERROR",
                    error: err.message,
                    finishedAt: new Date()
                }
            );

            await this.queueManager.update(
                queue.id,
                {
                    processing: false,
                    activeJobId: null,
                    failedJobs:
                        queue.failedJobs + 1
                }
            );

            await this.printerManager.setStatus(
                printer.id,
                "ERROR"
            );

            this.eventBus.publish(
                "jobFailed",
                {
                    printer,
                    queue,
                    job,
                    error: err
                }
            );
        }
    }
    /*----------------------------------------------------------
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

    }*/

    //----------------------------------------------------------
    // Status
    //----------------------------------------------------------

    stats() {

        return {

            running: this.running,

            interval: this.interval, 

            maxParallelJobs: this.maxParallelJobs 

        };

    }

}

module.exports = Scheduler;