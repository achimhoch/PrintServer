"use strict";

const path = require("path");

//const test = require("./providers")

class Discovery {

    constructor(
        printerManager,
        eventBus,
        options = {}
    ) {

        this.printerManager = printerManager;
        this.eventBus = eventBus;

        this.options = {

            providers: [],
            providerPath: path.join(__dirname, "providers"),

            ...options

        };

        this.providers = new Map();

        this.running = false;

    }

    //----------------------------------------------------------
    // Provider laden
    //----------------------------------------------------------

    load() {
       // console.log(this.options.providerPath);
        for (const providerName of this.options.providers) {

            const Provider = require(

                path.join(

                    this.options.providerPath,

                    providerName

                )

            );

            const provider = new Provider(this.options);

            this.register(provider);

        }

    }

    //----------------------------------------------------------
    // Provider registrieren
    //----------------------------------------------------------

    register(provider) {

        const name = provider.constructor.name;

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

            error => this.eventBus.publish(

                "discoveryError",

                {

                    provider: name,

                    error

                }

            )

        );

        this.providers.set(

            name,

            provider

        );
        console.log(this.providers);

    }

    //----------------------------------------------------------
    // Start
    //----------------------------------------------------------

    async start() {

        if (this.running)
            return;

        this.running = true;

        this.eventBus.publish(

            "discoveryStarted"

        );

        for (const provider of this.providers.values()) {

            await provider.start();

        }

    }

    //----------------------------------------------------------
    // Stop
    //----------------------------------------------------------

    async stop() {

        if (!this.running)
            return;

        for (const provider of this.providers.values()) {

            await provider.stop();

        }

        this.running = false;

        this.eventBus.publish(

            "discoveryStopped"

        );

    }

    //----------------------------------------------------------
    // Drucker gefunden
    //----------------------------------------------------------

    async onPrinter(printer) {

        try {

            const saved = await this.printerManager.upsertDiscoveredPrinter(
                printer
            );

            this.eventBus.publish(

                "printerDiscovered",

                saved

            );

        }
        catch (err) {

            this.eventBus.publish(

                "discoveryError",

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

                "printerLost",

                printer

            );

        }
        catch (err) {

            this.eventBus.publish(

                "discoveryError",

                err

            );

        }

    }

    //----------------------------------------------------------
    // Einzelnen Provider starten
    //----------------------------------------------------------

    async startProvider(name) {

        const provider = this.providers.get(name);

        if (!provider)
            return;

        await provider.start();

    }

    //----------------------------------------------------------
    // Einzelnen Provider stoppen
    //----------------------------------------------------------

    async stopProvider(name) {

        const provider = this.providers.get(name);

        if (!provider)
            return;

        await provider.stop();

    }

    //----------------------------------------------------------
    // Provider abrufen
    //----------------------------------------------------------

    getProvider(name) {

        return this.providers.get(name);

    }

    getProviders() {

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

            providers: this.getProviders().map(

                provider => ({

                    name: provider.constructor.name,

                    running: provider.running

                })

            )

        };

    }

}

module.exports = Discovery;