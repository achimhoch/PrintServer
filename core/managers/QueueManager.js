"use strict";

const { EventEmitter } = require("events");

class QueueManager extends EventEmitter {

    constructor(repository, eventBus) {

        super();

        this.repository = repository;
        this.eventBus = eventBus;

    }

    //----------------------------------------------------------
    // Queue erzeugen
    //----------------------------------------------------------

    async create(queue) {

        const existing = await this.repository.findByPrinter(queue.printerId);

        if (existing) return existing;

        const saved = await this.repository.add(queue);

        this.eventBus.publish("queueCreated", saved);

        /*if (this.queues.has(printerId))
            return this.queues.get(printerId);

        const queue = {

            id: printerId,

            printerId,

            enabled: true,

            paused: false,

            jobs: []

        };

        this.queues.set(

            printerId,

            queue

        );

        this.emit(

            "queueCreated",

            queue

        );*/

        return queue;

    }

    //----------------------------------------------------------
    // Queue entfernen
    //----------------------------------------------------------

    async remove(id) {

        const queue = this.repository.get(id);

        if (!queue)
            return false;

        await this.repository.remove(id)

        //this.queues.delete(printerId);

       /* this.emit(

            "queueRemoved",

            queue

        );*/
        this.eventBus.publish("queueRemoved", queue);

        return true;

    }
    //----------------------------------------------------------
    //Aktualisieren
    //----------------------------------------------------------
    async update(id, value) {
        const queue = await this.repository.update(id, value);
        if (!queue) return null;
        this.eventBus.publish("queueUpdated", queue);
        return queue;
    }
    //----------------------------------------------------------
    //Pause
    //----------------------------------------------------------
    async pause(id) {
        const queue = await this.repository.update(id, {paused: true, status: "PAUSED"});
        if (!queue) return null;
        this.eventBus.publish("queuePaused", queue);
        return queue;
    }
    //----------------------------------------------------------
    //Fortsetzen
    //----------------------------------------------------------
    async resume(id) {
        const queue = await this.repository.update(id, {paused: false, status: "READY"});
        if (!queue) return null;
        this.eventBus.publish("queueResumed", queue);
        return queue;
    }
    //----------------------------------------------------------
    //Aktivieren
    //----------------------------------------------------------
    async enable(id) {

        const queue = await this.repository.update(id, {enabled: true});

        if (!queue)
            return;

        this.eventBus("queueEnabled", queue);

        return queue;

        /*queue.enabled = true;

        this.emit(

            "queueEnabled",

            queue

        );*/

    }
    //----------------------------------------------------------
    //deaktivieren
    //----------------------------------------------------------

    async disable(id) {

        const queue = await this.repository.update(id, {enabled: false});

        if (!queue)
            return;

        this.eventBus.publish("queueDisabled", queue);
        return queue;

        /*queue.enabled = false;

        this.emit(

            "queueDisabled",

            queue

        );*/

    }
    //----------------------------------------------------------
    //Aktiven Job setzen
    //----------------------------------------------------------
    async setActiveJob(queueId, jobId) {
        return this.update(queueId, {processing: true, activeJob: jobId, lastJobStarted: new Date()});
    }
    //----------------------------------------------------------
    //Aktiven Job löschen
    //----------------------------------------------------------
    async clearActiveJob(queueId) {
        return this.update(queueId, {processing: false, activeJob: null, lastJobStarted: new Date()});
    }
    
    //----------------------------------------------------------
    // Getter
    //----------------------------------------------------------

    async get(id) {

        return this.repository.get(id);

    }

    /*has(printerId) {

        return this.queues.has(printerId);

    }*/

    async all() {

        return this.repository.all({order: [["priority", "DESC"], ["name", "ASC"]]});

    }

    async exists(id) {

        return this.repository.has(id)

        /*const queue = this.get(printerId);

        if (!queue)
            return [];

        return queue.jobs;*/

    }
    //----------------------------------------------------------
    //Suche
    //----------------------------------------------------------
    async findByPrinter(printerId) {
        return this.repository.findByPrinter(printerId);
    }

    async findEnabled() {
        return this.repository.findEnabled();
    }

    async findDisabled() {
        return this.repository.findDisabled();
    }

    async findPaused() {
        return this.repository.findPaused();
    }

    async findProcessing() {
        return this.repository.findProcessing();
    }

    async findIdle() {
        return this.repository.findIdle();
    }

    async findByStatus(status) {
        return this.repository.findByStatus(
            status
        );
    }


    //----------------------------------------------------------
    // Statistik
    //----------------------------------------------------------

    stats() {

        return this.repository.stats();

        /*let jobs = 0;

        for (const queue of this.queues.values()) {

            jobs += queue.jobs.length;

        }

        return {

            queues: this.queues.size,

            jobs,

            paused: this.all().filter(q => q.paused).length,

            enabled: this.all().filter(q => q.enabled).length

        };*/

    }

    //----------------------------------------------------------
    // Job hinzufügen
    //----------------------------------------------------------

    /*enqueue(printerId, job) {

        const queue = this.create(printerId);

        queue.jobs.push(job);

        this.sort(queue);

        this.emit(

            "jobQueued",

            {

                queue,

                job

            }

        );

        return job;

    }

    //----------------------------------------------------------
    // Nächsten Job holen
    //----------------------------------------------------------

    dequeue(printerId) {

        const queue = this.queues.get(printerId);

        if (!queue)
            return null;

        if (!queue.enabled)
            return null;

        if (queue.paused)
            return null;

        const job = queue.jobs.shift();

        if (job) {

            this.emit(

                "jobDequeued",

                {

                    queue,

                    job

                }

            );

        }

        return job;

    }

    //----------------------------------------------------------
    // Peek
    //----------------------------------------------------------

    peek(printerId) {

        const queue = this.queues.get(printerId);

        if (!queue)
            return null;

        return queue.jobs[0] || null;

    }

    //----------------------------------------------------------
    // Pause
    //----------------------------------------------------------

    pause(printerId) {

        const queue = this.queues.get(printerId);

        if (!queue)
            return;

        queue.paused = true;

        this.emit(

            "queuePaused",

            queue

        );

    }

    resume(printerId) {

        const queue = this.queues.get(printerId);

        if (!queue)
            return;

        queue.paused = false;

        this.emit(

            "queueResumed",

            queue

        );

    }

    //----------------------------------------------------------
    // Priorität
    //----------------------------------------------------------

    sort(queue) {

        queue.jobs.sort((a, b) => {

            const pa = a.priority || 50;
            const pb = b.priority || 50;

            if (pa !== pb)
                return pb - pa;

            return a.created - b.created;

        });

    }*/

     /*size(printerId) {

        const queue = this.get(printerId);

        if (!queue)
            return 0;

        return queue.jobs.length;

    }

    clear(printerId) {

        const queue = this.get(printerId);

        if (!queue)
            return;

        queue.jobs = [];

        this.emit(

            "queueCleared",

            queue

        );

    }*/


}

module.exports = QueueManager;