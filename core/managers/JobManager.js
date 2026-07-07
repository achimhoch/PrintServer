"use strict";

const { EventEmitter } = require("events");
const { randomUUID } = require("crypto");

class JobManager extends EventEmitter {

    constructor(repository, eventBus) {

        super();

        //this.jobs = new Map();
        this.repository = repository;
        this.eventBus = eventBus;

    }

    //----------------------------------------------------------
    // Job erzeugen
    //----------------------------------------------------------

    async create(job) {

        /*const job = {

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
        );*/

        job.status ??= "QUEUED";
        job.submittedAt ??= new Date();
        const saved = await this.repository.add(job);
        this.eventBus.publish("jobCreated", saved);
        return saved;

    }
    //----------------------------------------------------------
    // Löschen
    //----------------------------------------------------------

    async remove(id) {

        const job = this.repository.get(id);

        if (!job)
            return false;

        await this.repository.remove(id);

        /*this.emit(
            "jobRemoved",
            job
        );*/
        this.eventBus.publish("jobRemoved", job);

        return true;

    }
    //----------------------------------------------------------
    //Aktualisieren
    //----------------------------------------------------------
    async update(id, values) {
        const job = await this.repository.update(id, values);
        if (!job) return null;
        this.eventBus.publish("jobUpdated", job);
        return job;
    }

    //----------------------------------------------------------
    // Job starten
    //----------------------------------------------------------
    async start(id) {

        const job = await this.repository.update(id, {status: "PRINTING", startedAt: new Date()});

        if (!job)
            return null;

        this.eventBus.publish("jobStarted", job);

        /*job.status = "PRINTING";
        job.started = new Date();

        this.emit(
            "jobStarted",
            job
        );*/

        return job;

    }
    //---------------------------------------------
    //job abschließen
    //---------------------------------------------

    async complete(id) {

        const job = await this.repository.update(id, {status: "COMPLETED", finishedAt: new Date()});

        if (!job)
            return null;

        this.eventBus.publish("jobFinished", job);

        /*job.status = "FINISHED";
        job.finished = new Date();

        this.emit(
            "jobFinished",
            job
        );*/

        return job;

    }

    async cancel(id, reason = null) {

        const job = await this.repository.update(id, {status: "CANCELLED", finishedAt: new Date(), cancelReason: reason});

        if (!job)
            return null;

        this.eventBus.publish("jobCancelled", job);

        /*job.status = "CANCELLED";
        job.finished = new Date();

        this.emit(
            "jobCancelled",
            job
        );*/

        return job;

    }

    async fail(id, error) {

        const job = await this.repository.update(id, {status: "ERROR", error: error?.message ?? error, finishedAt: new Date()});

        if (!job)
            return null;

        this.eventBus.publish("jofFailed", job, error);

        /*job.status = "ERROR";
        job.error = err;
        job.finished = new Date();

        this.emit(
            "jobError",
            {
                job,
                error: err
            }
        );*/

        return job;

    }

    //----------------------------------------------------------
    // Progress
    //----------------------------------------------------------

    async progress(id, progress) {

        const job = await this.repository.update(id, progress);

        if (!job)
            return;

        this.eventBus.publish("jobProgress", job, progress);

        /*job.progress = value;

        this.emit(
            "jobProgress",
            job
        );*/

        return job;

    }

    //----------------------------------------------------------
    // Getter
    //----------------------------------------------------------

    async get(id) {
        return this.repository.get(id);
    }

    /*has(id) {

        return this.jobs.has(id);

    }*/

    async all() {
        return this.repository.all({order: [["submittedAt", "DESC"]]});
    }

    async exists(id) {
        return this.repository.has(id);
    }
    //--------------------------------------------
    //Scheduler
    //--------------------------------------------

    async nextJob(queueId) {
        return this.repository.nextJob(queueId);
    }
    //--------------------------------------------
    //Suche
    //--------------------------------------------

    async findQueued() {
        return this.repository.findQueued();
    }

    async findPrinting() {
        return this.repository.findPrinting();
    }

    async findCompleted(limit) {
        return this.repository.findCompleted(limit);
    }

    async findFailed() {

        return this.repository.findFailed();

    }

    async findCancelled() {
        return this.repository.findCancelled();
    }

    async findByOwner(owner) {
        return this.repository.findByOwner(owner);
    }

    async findByPrinter(printerId) {
        return this.repository.findByPrinter(printerId);
    }

    async findByQueue(queueId) {
        return this.repository.findByQueue(queueId);
    }

    //----------------------------------------------------------
    // Statistik
    //----------------------------------------------------------

    stats() {

        return this.repository.stats();

        /*const jobs = this.all();

        return {

            total: jobs.length,

            queued: jobs.filter(j => j.status === "QUEUED").length,

            printing: jobs.filter(j => j.status === "PRINTING").length,

            finished: jobs.filter(j => j.status === "FINISHED").length,

            cancelled: jobs.filter(j => j.status === "CANCELLED").length,

            error: jobs.filter(j => j.status === "ERROR").length

        };*/

    }

}

module.exports = JobManager;