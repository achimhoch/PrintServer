"use strict";

class JobManager {

    constructor(service, eventBus) {

        this.service = service;
        this.eventBus = eventBus;

    }

    //----------------------------------------------------------
    // Job anlegen
    //----------------------------------------------------------

    async create(job) {

        job.status ??= "QUEUED";
        job.submittedAt ??= new Date();

        const saved =
            await this.service.create(job);

        this.eventBus.publish(
            "jobCreated",
            saved
        );

        return saved;

    }

    //----------------------------------------------------------
    // Job entfernen
    //----------------------------------------------------------

    async remove(id) {

        const job =
            await this.service.get(id);

        if (!job)
            return false;

        await this.service.remove(id);

        this.eventBus.publish(
            "jobRemoved",
            job
        );

        return true;

    }

    //----------------------------------------------------------
    // Job aktualisieren
    //----------------------------------------------------------

    async update(id, values) {

        const job =
            await this.service.update(
                id,
                values
            );

        if (!job)
            return null;

        this.eventBus.publish(
            "jobUpdated",
            job
        );

        return job;

    }

    //----------------------------------------------------------
    // Job starten
    //----------------------------------------------------------

    async start(id) {

        const job =
            await this.service.start(id);

        if (!job)
            return null;

        this.eventBus.publish(
            "jobStarted",
            job
        );

        return job;

    }

    //----------------------------------------------------------
    // Job abschließen
    //----------------------------------------------------------

    async complete(id) {

        const job =
            await this.service.complete(id);

        if (!job)
            return null;

        this.eventBus.publish(
            "jobFinished",
            job
        );

        return job;

    }

    //----------------------------------------------------------
    // Job abbrechen
    //----------------------------------------------------------

    async cancel(id, reason = null) {

        const job =
            await this.service.cancel(
                id,
                reason
            );

        if (!job)
            return null;

        this.eventBus.publish(
            "jobCancelled",
            job
        );

        return job;

    }

    //----------------------------------------------------------
    // Fehler
    //----------------------------------------------------------

    async fail(id, error) {

        const job =
            await this.service.fail(
                id,
                error
            );

        if (!job)
            return null;

        this.eventBus.publish(

            "jobFailed",

            {
                job,
                error
            }

        );

        return job;

    }

    //----------------------------------------------------------
    // Fortschritt
    //----------------------------------------------------------

    async progress(id, progress) {

        const job =
            await this.service.progress(
                id,
                progress
            );

        if (!job)
            return null;

        this.eventBus.publish(

            "jobProgress",

            {
                job,
                progress
            }

        );

        return job;

    }

    //---------------------------------------------------------- 
    // Einzelnen Job
    //----------------------------------------------------------

    async get(id) {

        return this.service.get(id);

    }

    //----------------------------------------------------------
    // Alle Jobs
    //----------------------------------------------------------

    async all() {

        return this.service.all();

    }

    //----------------------------------------------------------
    // Existenz
    //----------------------------------------------------------

    async exists(id) {

        return this.service.exists(id);

    }

    //----------------------------------------------------------
    // Scheduler
    //----------------------------------------------------------

    async nextJob(queueId) {

        return this.service.nextJob(
            queueId
        );

    }

    //----------------------------------------------------------
    // Status
    //----------------------------------------------------------

    async findQueued() {

        return this.service.findQueued();

    }

    async findPrinting() {

        return this.service.findPrinting();

    }

    async findCompleted(limit) {

        return this.service.findCompleted(
            limit
        );

    }

    async findFailed() {

        return this.service.findFailed();

    }

    async findCancelled() {

        return this.service.findCancelled();

    }

    //----------------------------------------------------------
    // Suche
    //----------------------------------------------------------

    async findByOwner(owner) {

        return this.service.findByOwner(
            owner
        );

    }

    async findByPrinter(printerId) {

        return this.service.findByPrinter(
            printerId
        );

    }

    async findByQueue(queueId) {

        return this.service.findByQueue(
            queueId
        );

    }

    //----------------------------------------------------------
    // Statistik
    //----------------------------------------------------------

    async stats() {

        return this.service.stats();

    }

}

module.exports = JobManager;