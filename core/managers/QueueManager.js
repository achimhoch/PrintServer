"use strict";

const { EventEmitter } = require("events");

class QueueManager extends EventEmitter {

    constructor() {

        super();

        this.queues = new Map();

    }

    //----------------------------------------------------------
    // Queue erzeugen
    //----------------------------------------------------------

    create(printerId) {

        if (this.queues.has(printerId))
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

        );

        return queue;

    }

    //----------------------------------------------------------
    // Queue entfernen
    //----------------------------------------------------------

    remove(printerId) {

        const queue = this.queues.get(printerId);

        if (!queue)
            return false;

        this.queues.delete(printerId);

        this.emit(

            "queueRemoved",

            queue

        );

        return true;

    }

    //----------------------------------------------------------
    // Job hinzufügen
    //----------------------------------------------------------

    enqueue(printerId, job) {

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

    enable(printerId) {

        const queue = this.queues.get(printerId);

        if (!queue)
            return;

        queue.enabled = true;

        this.emit(

            "queueEnabled",

            queue

        );

    }

    disable(printerId) {

        const queue = this.queues.get(printerId);

        if (!queue)
            return;

        queue.enabled = false;

        this.emit(

            "queueDisabled",

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

    }

    //----------------------------------------------------------
    // Getter
    //----------------------------------------------------------

    get(printerId) {

        return this.queues.get(printerId);

    }

    has(printerId) {

        return this.queues.has(printerId);

    }

    all() {

        return [...this.queues.values()];

    }

    jobs(printerId) {

        const queue = this.get(printerId);

        if (!queue)
            return [];

        return queue.jobs;

    }

    size(printerId) {

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

    }

    //----------------------------------------------------------
    // Statistik
    //----------------------------------------------------------

    stats() {

        let jobs = 0;

        for (const queue of this.queues.values()) {

            jobs += queue.jobs.length;

        }

        return {

            queues: this.queues.size,

            jobs,

            paused: this.all().filter(q => q.paused).length,

            enabled: this.all().filter(q => q.enabled).length

        };

    }

}

module.exports = QueueManager;