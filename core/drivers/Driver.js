"use strict";

const EventEmitter = require("events");

class Driver extends EventEmitter {

    constructor(options = {}) {

        super();

        this.name = options.name || this.constructor.name;

        this.protocols = options.protocols || [];

        this.platforms = options.platforms || [

            "linux",

            "windows"

        ];

        this.version = options.version || "2.0";

        this.enabled = options.enabled !== false;

        this.running = false;

        this.jobs = 0;

        this.errors = 0;

    }

    //----------------------------------------------------------

    async initialize() {

    }

    //----------------------------------------------------------

    async start() {

        this.running = true;

    }

    //----------------------------------------------------------

    async stop() {

        this.running = false;

    }

    //----------------------------------------------------------

    supports(printer) {

        return this.protocols.includes(

            printer.protocol

        );

    }

    //----------------------------------------------------------

    async print(printer, job) {

        throw new Error(

            "print() not implemented."

        );

    }

    //----------------------------------------------------------

    async cancel(job) {

        throw new Error(

            "cancel() not implemented."

        );

    }

    //----------------------------------------------------------

    capabilities() {

        return {

            color: false,

            duplex: false,

            copies: true,

            stapling: false

        };

    }

    //----------------------------------------------------------

    statistics() {

        return {

            driver: this.name,

            running: this.running,

            jobs: this.jobs,

            errors: this.errors

        };

    }

}

module.exports = Driver;