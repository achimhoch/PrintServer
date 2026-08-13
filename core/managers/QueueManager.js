"use strict";

class QueueManager {

    constructor(service, eventBus) {

        this.service = service;
        this.eventBus = eventBus;

    }

    //----------------------------------------------------------
    // Queue anlegen
    //----------------------------------------------------------

    async create(queue) {

        const existing = await this.service.findByPrinter(queue.printerId);

        if (existing)
            return existing;

        const saved = await this.service.create(queue); 

        this.eventBus.publish(
            "queueCreated",
            saved
        );

        return saved;

    }

    //----------------------------------------------------------
    // Queue entfernen
    //----------------------------------------------------------

    async remove(id) {

        const queue =
            await this.service.get(id);

        if (!queue)
            return false;

        await this.service.remove(id);

        this.eventBus.publish(
            "queueRemoved",
            queue
        );

        return true;

    }

    //----------------------------------------------------------
    // Queue aktualisieren
    //----------------------------------------------------------

    async update(id, values) {

        const queue =
            await this.service.update(
                id,
                values
            );

        if (!queue)
            return null;

        this.eventBus.publish(
            "queueUpdated",
            queue
        );

        return queue;

    }

    //----------------------------------------------------------
    // Queue pausieren
    //----------------------------------------------------------

    async pause(id) {

        const queue =
            await this.service.update(

                id,

                {
                    paused: true,
                    status: "PAUSED"
                }

            );

        if (!queue)
            return null;

        this.eventBus.publish(
            "queuePaused",
            queue
        );

        return queue;

    }

    //----------------------------------------------------------
    // Queue fortsetzen
    //----------------------------------------------------------

    async resume(id) {

        const queue =
            await this.service.update(

                id,

                {
                    paused: false,
                    status: "READY"
                }

            );

        if (!queue)
            return null;

        this.eventBus.publish(
            "queueResumed",
            queue
        );

        return queue;

    }

    //----------------------------------------------------------
    // Queue aktivieren
    //----------------------------------------------------------

    async enable(id) {

        const queue =
            await this.service.update(

                id,

                {
                    enabled: true
                }

            );

        if (!queue)
            return null;

        this.eventBus.publish(
            "queueEnabled",
            queue
        );

        return queue;

    }

    //----------------------------------------------------------
    // Queue deaktivieren
    //----------------------------------------------------------

    async disable(id) {

        const queue =
            await this.service.update(

                id,

                {
                    enabled: false
                }

            );

        if (!queue)
            return null;

        this.eventBus.publish(
            "queueDisabled",
            queue
        );

        return queue;

    }

    //----------------------------------------------------------
    // Aktiven Job setzen
    //----------------------------------------------------------

    async setActiveJob(queueId, jobId) {

        return this.update(

            queueId,

            {
                processing: true,
                activeJobId: jobId,
                lastJobStarted: new Date()
            }

        );

    }

    //----------------------------------------------------------
    // Aktiven Job löschen
    //----------------------------------------------------------

    async clearActiveJob(queueId) { 

        return this.update(

            queueId,

            {
                processing: false,
                activeJobId: null,
                lastJobFinished: new Date()
            }

        );

    }

    //----------------------------------------------------------
    // Queue abrufen
    //----------------------------------------------------------

    async get(id) {

        return this.service.get(id);

    }

    //----------------------------------------------------------
    // Alle Queues
    //----------------------------------------------------------

    async All() {

        return this.service.all();

    }

    //----------------------------------------------------------
    // Existenz prüfen
    //----------------------------------------------------------

    async exists(id) {

        return this.service.exists(id);

    }

    //----------------------------------------------------------
    // Suche nach Drucker
    //----------------------------------------------------------

    async findByPrinter(printerId) {

        return this.service.findByPrinter(
            printerId
        );

    }

    //----------------------------------------------------------
    // Aktivierte Queues
    //----------------------------------------------------------

    async findEnabled() {

        return this.service.findEnabled();

    }

    //----------------------------------------------------------
    // Deaktivierte Queues
    //----------------------------------------------------------

    async findDisabled() {

        return this.service.findDisabled();

    }

    //----------------------------------------------------------
    // Pausierte Queues
    //----------------------------------------------------------

    async findPaused() {

        return this.service.findPaused();

    }

    //----------------------------------------------------------
    // Verarbeitende Queues
    //----------------------------------------------------------

    async findProcessing() {

        return this.service.findProcessing();

    }

    //----------------------------------------------------------
    // Leerlaufende Queues
    //----------------------------------------------------------

    async findIdle() {

        return this.service.findIdle();

    }

    //----------------------------------------------------------
    // Status
    //----------------------------------------------------------

    async findByStatus(status) {

        return this.service.findByStatus(
            status
        );

    }

    //----------------------------------------------------------
    // Statistik
    //----------------------------------------------------------

    async stats() {

        return this.service.stats();

    }

}

module.exports = QueueManager;