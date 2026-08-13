"use strict";

const BaseService = require("./BaseService");

class JobService extends BaseService {

    constructor(repository, eventBus) {

        super(
            repository,
            eventBus
        );

    }

    //----------------------------------------------------------
    // Job anlegen
    //----------------------------------------------------------

    async create(job) {

        job.status ??= "QUEUED";
        job.submittedAt ??= new Date();

        return this.repository.add(job);

    }

    //----------------------------------------------------------
    // Job aktualisieren
    //----------------------------------------------------------

    async update(id, values) {

        return this.repository.update(
            id,
            values
        );

    }

    //----------------------------------------------------------
    // Job entfernen
    //----------------------------------------------------------

    async remove(id) {

        return this.repository.remove(
            id
        );

    }

    //----------------------------------------------------------
    
    // Job abrufen
    //----------------------------------------------------------

    async get(id) {

        return this.repository.get(
            id
        );

    }

    //----------------------------------------------------------
    // Alle Jobs
    //----------------------------------------------------------

    async all() {

        return this.repository.all({

            order: [

                ["submittedAt", "DESC"]

            ]

        });

    }

    //----------------------------------------------------------
    // Existenz
    //----------------------------------------------------------

    async exists(id) {

        return this.repository.has(
            id
        );

    }

    //----------------------------------------------------------
    // Start
    //----------------------------------------------------------

    async start(id) {

        return this.repository.update(

            id,

            {

                status: "PRINTING",

                startedAt: new Date()

            }

        );

    }

    //----------------------------------------------------------
    // Abschluss
    //----------------------------------------------------------

    async complete(id) {

        return this.repository.update(

            id,

            {

                status: "COMPLETED",

                finishedAt: new Date()

            }

        );

    }

    //----------------------------------------------------------
    // Abbruch
    //----------------------------------------------------------

    async cancel(id, reason = null) {

        return this.repository.update(

            id,

            {

                status: "CANCELLED",

                finishedAt: new Date(),

                cancelReason: reason

            }

        );

    }

    //----------------------------------------------------------
    // Fehler
    //----------------------------------------------------------

    async fail(id, error) {

        return this.repository.update(

            id,

            {

                status: "ERROR",

                error:
                    error?.message ??
                    String(error),

                finishedAt: new Date()

            }

        );

    }

    //----------------------------------------------------------
    // Fortschritt
    //----------------------------------------------------------

    async progress(id, progress) {

        return this.repository.update(

            id,

            {

                progress

            }

        );

    }

    //----------------------------------------------------------
    // Scheduler
    //----------------------------------------------------------

    async nextJob(queueId) {

        return this.repository.nextJob(
            queueId
        );

    }

    //----------------------------------------------------------
    // Status
    //----------------------------------------------------------

    async findQueued() {

        return this.repository.findQueued();

    }

    async findPrinting() {

        return this.repository.findPrinting();

    }

    async findCompleted(limit) {

        return this.repository.findCompleted(
            limit
        );

    }

    async findFailed() {

        return this.repository.findFailed();

    }

    async findCancelled() {

        return this.repository.findCancelled();

    }

    //----------------------------------------------------------
    // Suche
    //----------------------------------------------------------

    async findByOwner(owner) {

        return this.repository.findByOwner(
            owner
        );

    }

    async findByPrinter(printerId) {

        return this.repository.findByPrinter(
            printerId
        );

    }

    async findByQueue(queueId) {

        return this.repository.findByQueue(
            queueId
        );

    }

    //----------------------------------------------------------
    // Statistik
    //----------------------------------------------------------

    async stats() {

        return this.repository.stats();

    }

}

module.exports = JobService;