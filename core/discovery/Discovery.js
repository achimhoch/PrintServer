"use strict";

const { EventEmitter } = require("events"); 
const path = require('path');
const fs = require('fs');

class Discovery extends EventEmitter {

    constructor(printManager, eventBus, options = {}) {

        super();
        //console.log(eventBus);
        this.printManager = printManager;
        this.eventBus = eventBus;
        this.options = options;
        this.providers = [];
        this.running = false;

    }

    //----------------------------------------------------------
    // Provider
    //----------------------------------------------------------

    register(provider) {

        /*this.providers.push(provider);

        this.bindProvider(provider);

        return this;*/
        provider.on("printer", (printer) => this.onPrinter(printer));
        provider.on("error", (error) => this.eventBus.publish("discoveryError", error));
        this.providers.push(provider);

    }

    unregister(provider) {

        this.providers = this.providers.filter(

            p => p !== provider

        );

    }

    getProviders() {

        return this.providers;

    }

    load(directory) {
        const files = fs.readdirSync(directory);
        for (const file of files) {
            if (!file.endsWith("Provider.js")) {
                continue;
            }
            const Provider = require(path.join(directory, file));
            const provider = new Provider(this.options, this.eventBus);
            this.register(provider);
        }
    }

    //----------------------------------------------------------
    // Start / Stop
    //----------------------------------------------------------

    async start() {

        if (this.running)
            return;

        this.running = true;

        //this.emit("started");

        this.eventBus.publish("discoveryStarted");

        for (const provider of this.providers) {

            if (provider.start) {

                await provider.start();

            }

        }

    }

    async stop() {

        if (!this.running)
            return;


        for (const provider of this.providers) {

            if (provider.stop) {

                await provider.stop();

            }

        }

        this.running = false;

        //this.emit("stopped");

        this.eventBus.publish("discoveryStopped");

    }

    //----------------------------------------------------------
    // Scan erneut starten
    //----------------------------------------------------------

    async restart() {

        await this.stop()
        await this.start();

        /*for (const provider of this.providers) {

            if (typeof provider.scan === "function") {

                await provider.scan();

            }

        }*/

    }
    //----------------------------------------------------------
    //Drucker gefunden
    //----------------------------------------------------------
    async onPrinter(printer) {
        try{
            const existing = await this.printerManager.repository.findByIp(printer.ip);
            if (existing) {
                await this.printerManager.update(existing.id, {...printer, lastSeen: new Date(), online: true});
                this.eventBus.publish("printerUpdated", existing);
                return;
            }
            printer.online = true;
            printer.lastSeen = new Date();
            await this.printerManager.add(printer);
            this.eventBus.publish("printerDiscovered", printer);

        }
        catch (err) {
             this.eventBus.publish("discoveryError", err);
        }
    }  

        

    //----------------------------------------------------------
    // Events der Provider übernehmen
    //----------------------------------------------------------

    /*bindProvider(provider) {

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

    }*/

    //----------------------------------------------------------
    // Status
    //----------------------------------------------------------

    /*isRunning() {

        return this.running;

    }*/

    stats() {

        return {

            running: this.running,

            providers: this.providers.map(provider => ({name: provider.constructor.name, running: provider.running ?? false})) 

        };

    }

}

module.exports = Discovery;