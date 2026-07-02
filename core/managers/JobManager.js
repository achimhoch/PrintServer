"use strict";

const { EventEmitter } = require("events");
const { randomUUID } = require("crypto");

class JobManager extends EventEmitter {

    constructor() {

        super();

        this.jobs = new Map();

    }

    //----------------------------------------------------------
    // Job erzeugen
    //----------------------------------------------------------

    create(options = {}) {

        const job = {

            id: options.id || randomUUID(),

            printerId: options.printerId,

            queueId: options.queueId,

            user: options.user || "system",

            name: options.name || "Untitled",

            mimeType: options.mimeType || "application/octet-stream",

            buffer: options.buffer,

            copies: options.copies || 1,

            priority: options.priority || 50,

            status: "QUEUED",

            pages: options.pages || 0,

            created: new Date(),

            started: null,

            finished: null,

            error: null

        };

        this.jobs.set(
            job.id,
            job
        );

        this.emit(
            "jobCreated",
            job
        );

        return job;

    }

    //----------------------------------------------------------
    // Status
    //----------------------------------------------------------

    start(id) {

        const job = this.jobs.get(id);

        if (!job)
            return null;

        job.status = "PRINTING";
        job.started = new Date();

        this.emit(
            "jobStarted",
            job
        );

        return job;

    }

    finish(id) {

        const job = this.jobs.get(id);

        if (!job)
            return null;

        job.status = "FINISHED";
        job.finished = new Date();

        this.emit(
            "jobFinished",
            job
        );

        return job;

    }

    cancel(id) {

        const job = this.jobs.get(id);

        if (!job)
            return null;

        job.status = "CANCELLED";
        job.finished = new Date();

        this.emit(
            "jobCancelled",
            job
        );

        return job;

    }

    error(id, err) {

        const job = this.jobs.get(id);

        if (!job)
            return null;

        job.status = "ERROR";
        job.error = err;
        job.finished = new Date();

        this.emit(
            "jobError",
            {
                job,
                error: err
            }
        );

        return job;

    }

    //----------------------------------------------------------
    // Progress
    //----------------------------------------------------------

    progress(id, value) {

        const job = this.jobs.get(id);

        if (!job)
            return;

        job.progress = value;

        this.emit(
            "jobProgress",
            job
        );

    }

    //----------------------------------------------------------
    // Getter
    //----------------------------------------------------------

    get(id) {

        return this.jobs.get(id);

    }

    has(id) {

        return this.jobs.has(id);

    }

    all() {

        return [...this.jobs.values()];

    }

    queued() {

        return this.all().filter(

            j => j.status === "QUEUED"

        );

    }

    printing() {

        return this.all().filter(

            j => j.status === "PRINTING"

        );

    }

    finished() {

        return this.all().filter(

            j => j.status === "FINISHED"

        );

    }

    byPrinter(printerId) {

        return this.all().filter(

            j => j.printerId === printerId

        );

    }

    //----------------------------------------------------------
    // Löschen
    //----------------------------------------------------------

    remove(id) {

        const job = this.jobs.get(id);

        if (!job)
            return false;

        this.jobs.delete(id);

        this.emit(
            "jobRemoved",
            job
        );

        return true;

    }

    clearFinished() {

        for (const job of this.jobs.values()) {

            if (

                job.status === "FINISHED" ||

                job.status === "CANCELLED" ||

                job.status === "ERROR"

            ) {

                this.jobs.delete(job.id);

            }

        }

    }

    //----------------------------------------------------------
    // Statistik
    //----------------------------------------------------------

    stats() {

        const jobs = this.all();

        return {

            total: jobs.length,

            queued: jobs.filter(j => j.status === "QUEUED").length,

            printing: jobs.filter(j => j.status === "PRINTING").length,

            finished: jobs.filter(j => j.status === "FINISHED").length,

            cancelled: jobs.filter(j => j.status === "CANCELLED").length,

            error: jobs.filter(j => j.status === "ERROR").length

        };

    }

}

module.exports = JobManager;