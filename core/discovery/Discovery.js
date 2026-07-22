"use strict";

const EventEmitter = require("events");

class Discovery extends EventEmitter {

    constructor(

        printerManager,

        eventBus,

        options = {}

    ) {

        super();

        this.printerManager = printerManager;

        this.eventBus = eventBus;

        this.options = {

            enabled: true,

            interval: 300000,

            ...options

        };

        this.providers = new Map();

        this.running = false;

        this.timer = null;

    }

    //----------------------------------------------------------
    // Initialisieren
    //----------------------------------------------------------

    async initialize() {

        for (const provider of this.providers.values()) {

            if (typeof provider.initialize === "function") {

                await provider.initialize();

            }

        }

    }

    //----------------------------------------------------------
    // Provider registrieren
    //----------------------------------------------------------

    register(provider) {

        if (!provider)
            throw new Error("Provider is required.");

        if (!provider.name)
            throw new Error("Provider has no name.");

        if (this.providers.has(provider.name))
            throw new Error(`Provider '${provider.name}' already registered.`);

        provider.on(

            "printer",

            printer => this.onPrinter(printer)

        );

        provider.on(

            "printerLost",

            printer => this.onPrinterLost(printer)

        );

        provider.on(

            "error",

            error => this.onError(

                provider,

                error

            )

        );

        this.providers.set(

            provider.name,

            provider

        );

        this.eventBus.publish(

            "discovery.provider.registered",

            {

                provider: provider.name

            }

        );

        return provider;

    }

    //----------------------------------------------------------
    // Provider entfernen
    //----------------------------------------------------------

    unregister(name) {

        return this.providers.delete(name);

    }

    //----------------------------------------------------------
    // Start
    //----------------------------------------------------------

    async start() {

        if (this.running)
            return;

        this.running = true;

        for (const provider of this.providers.values()) {

            await provider.start();

        }

        if (this.options.interval > 0) {

            this.timer = setInterval(

                () => this.scan(),

                this.options.interval

            );

        }

        this.eventBus.publish(

            "discovery.started"

        );

    }

    //----------------------------------------------------------
    // Stop
    //----------------------------------------------------------

    async stop() {

        if (!this.running)
            return;

        clearInterval(

            this.timer

        );

        this.timer = null;

        for (const provider of this.providers.values()) {

            await provider.stop();

        }

        this.running = false;

        this.eventBus.publish(

            "discovery.stopped"

        );

    }

    //----------------------------------------------------------
    // Manueller Scan
    //----------------------------------------------------------

    async scan() {

        if (!this.running)
            return;

        this.eventBus.publish(

            "discovery.scan.started"

        );

        for (const provider of this.providers.values()) {

            if (typeof provider.scan === "function") {

                await provider.scan();

            }

        }

        this.eventBus.publish(

            "discovery.scan.finished"

        );

    }

    //----------------------------------------------------------
    // Drucker gefunden
    //----------------------------------------------------------

    async onPrinter(printer) {

        try {

            const saved =

                await this.printerManager.upsertDiscovery(

                    printer

                );

            this.eventBus.publish(

                "printer.discovered",

                saved

            );

        }
        catch (err) {

            this.onError(

                null,

                err

            );

        }

    }

    //----------------------------------------------------------
    // Drucker verschwunden
    //----------------------------------------------------------

    async onPrinterLost(printer) {

        try {

            await this.printerManager.setOffline(

                printer.id ||

                printer.ip

            );

            this.eventBus.publish(

                "printer.lost",

                printer

            );

        }
        catch (err) {

            this.onError(

                null,

                err

            );

        }

    }

    //----------------------------------------------------------
    // Fehler
    //----------------------------------------------------------

    onError(provider, error) {

        this.eventBus.publish(

            "discovery.error",

            {

                provider:

                    provider ?

                    provider.name :

                    null,

                error

            }

        );

    }

    //----------------------------------------------------------
    // Provider
    //----------------------------------------------------------

    get(name) {

        return this.providers.get(name);

    }

    list() {

        return [

            ...this.providers.values()

        ];

    }

    //----------------------------------------------------------
    // Status
    //----------------------------------------------------------

    status() {

        return {

            running: this.running,

            interval: this.options.interval,

            providers: this.list().map(

                provider => ({

                    name: provider.name,

                    running: provider.running

                })

            )

        };

    }

}

module.exports = Discovery;