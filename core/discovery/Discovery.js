"use strict";

const EventEmitter = require("events");

const ProviderRegistry = require("./ProviderRegistry");

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

            interval: 30000,

            autoStart: true,

            providers: [],

            ...options

        };

        this.registry = new ProviderRegistry();

        this.running = false;

        this.timer = null;

    }

    //----------------------------------------------------------
    // Initialisieren
    //----------------------------------------------------------

    async initialize() {

        for (const provider of this.options.providers) {

            this.registry.register(

                provider

            );

        }

        //
        // Events der Provider abonnieren
        //

        for (const provider of this.registry.all()) {

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

        }

    }

    //----------------------------------------------------------
    // Start
    //----------------------------------------------------------

    async start() {

        if (this.running)
            return;

        this.running = true;

        this.eventBus.publish(

            "discovery.started"

        );

        //
        // Provider starten
        //

        for (const provider of this.registry.all()) {

            await provider.start();

        }

        //
        // Zyklische Discovery
        //

        this.timer = setInterval(

            () => {

                this.scan()

                    .catch(err => {

                        this.onError(

                            null,

                            err

                        );

                    });

            },

            this.options.interval

        );

        //
        // Sofortiger erster Scan
        //

        await this.scan();

    }

    //----------------------------------------------------------
    // Stop
    //----------------------------------------------------------

    async stop() {

        if (!this.running)
            return;

        this.running = false;

        clearInterval(this.timer);

        this.timer = null;

        for (const provider of this.registry.all()) {

            await provider.stop();

        }

        this.eventBus.publish(

            "discovery.stopped"

        );

    }

    //----------------------------------------------------------
    // Scan auslösen
    //----------------------------------------------------------

    async scan() {

        if (!this.running)
            return;

        this.eventBus.publish(

            "discovery.scan.started"

        );

        const providers = this.registry.enabled();

        await Promise.all(

            providers.map(

                provider => provider.scan()

            )

        );

        this.eventBus.publish(

            "discovery.scan.finished"

        );

    }

    //----------------------------------------------------------
    // Drucker gefunden
    //----------------------------------------------------------

    async onPrinter(printer) {

        try {

            const entity =

                await this.printerManager.upsertDiscoveredPrinter(

                    printer

                );

            this.eventBus.publish(

                "printer.discovered",

                entity

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

                    provider

                        ? provider.name

                        : null,

                error

            }

        );

    }

    //----------------------------------------------------------
    // Provider registrieren
    //----------------------------------------------------------

    register(provider) {

        this.registry.register(

            provider

        );

    }

    //----------------------------------------------------------
    // Provider entfernen
    //----------------------------------------------------------

    unregister(name) {

        this.registry.unregister(

            name

        );

    }

    //----------------------------------------------------------
    // Provider liefern
    //----------------------------------------------------------

    getProvider(name) {

        return this.registry.get(

            name

        );

    }

    //----------------------------------------------------------
    // Status
    //----------------------------------------------------------

    status() {

        return {

            running: this.running,

            interval: this.options.interval,

            providers:

                this.registry.all()

                    .map(provider => ({

                        name: provider.name,

                        enabled: provider.enabled,

                        running: provider.running

                    }))

        };

    }

}

module.exports = Discovery;