"use strict";

const { EventEmitter } = require("events"); 

class Discovery extends EventEmitter {

    constructor(eventBus) {

        super();

        this.eventBus = eventBus;

        this.providers = [];

        this.running = false;

    }

    //----------------------------------------------------------
    // Provider
    //----------------------------------------------------------

    register(provider) {

        this.providers.push(provider);

        this.bindProvider(provider);

        return this;

    }

    unregister(provider) {

        this.providers = this.providers.filter(

            p => p !== provider

        );

    }

    getProviders() {

        return this.providers;

    }

    //----------------------------------------------------------
    // Start / Stop
    //----------------------------------------------------------

    async start() {

        if (this.running)
            return;

        this.running = true;

        this.emit("started");

        this.eventBus.publish("discoveryStarted");

        for (const provider of this.providers) {

            if (typeof provider.start === "function") {

                await provider.start();

            }

        }

    }

    async stop() {

        if (!this.running)
            return;

        this.running = false;

        for (const provider of this.providers) {

            if (typeof provider.stop === "function") {

                await provider.stop();

            }

        }

        this.emit("stopped");

        this.eventBus.publish("discoveryStopped");

    }

    //----------------------------------------------------------
    // Scan erneut starten
    //----------------------------------------------------------

    async rescan() {

        for (const provider of this.providers) {

            if (typeof provider.scan === "function") {

                await provider.scan();

            }

        }

    }

    //----------------------------------------------------------
    // Events der Provider übernehmen
    //----------------------------------------------------------

    bindProvider(provider) {

        provider.on("printerFound", printer => {

            this.emit("printerFound", printer);

            this.eventBus.publish(

                "printerFound",

                printer

            );

        });

        provider.on("printerUpdated", printer => {

            this.emit("printerUpdated", printer);

            this.eventBus.publish(

                "printerUpdated",

                printer

            );

        });

        provider.on("printerLost", printer => {

            this.emit("printerLost", printer);

            this.eventBus.publish(

                "printerLost",

                printer

            );

        });

        provider.on("error", error => {

            this.emit("error", error);

            this.eventBus.publish(

                "discoveryError",

                error

            );

        });

    }

    //----------------------------------------------------------
    // Status
    //----------------------------------------------------------

    isRunning() {

        return this.running;

    }

    stats() {

        return {

            running: this.running,

            providers: this.providers.length

        };

    }

}

module.exports = Discovery;