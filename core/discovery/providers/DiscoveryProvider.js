"use strict";

const EventEmitter = require("events");

class DiscoveryProvider extends EventEmitter {

    constructor(options = {}) {

        super();

        this.options = options;

        this.running = false;

    }

    async start() {

        throw new Error("start() not implemented");

    }

    async stop() {

        this.running = false;

    }

}

module.exports = DiscoveryProvider;