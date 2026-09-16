"use strict";

const EventEmitter = require("events");
const logger = require("../logging/LogManager").getLogger("Discovery");

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

            // Tägliche Startzeit
            time: "03:00",

            ...options

        };

        this.providers = new Map();

        this.running = false;

        this.timer = null;

        this.scanning = false;
    }

    //----------------------------------------------------------
    // Initialisieren
    //----------------------------------------------------------

    async initialize() {

        for (const provider of this.providers.values()) {

            if (
                typeof provider.initialize === "function"
            ) {

                await provider.initialize();

            }

        }

    }

    //----------------------------------------------------------
    // Provider registrieren
    //----------------------------------------------------------

    register(provider) {

        if (!provider)
            throw new Error(
                "Provider is required."
            );

        if (!provider.name)
            throw new Error(
                "Provider has no name."
            );

        if (this.providers.has(provider.name))
            throw new Error(
                `Provider '${provider.name}' already registered.`
            );

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

        if (!this.options.enabled) {

            logger.info("Discovery deaktiviert");

            return;

        }

        this.running = true;

        this.eventBus.publish(
            "discovery.started"
        );

        logger.info(`Discovery gestartet. Nächster Scan: ${this.nextScanTime()}`);

        

        this.scheduleNextScan();

    }

    //----------------------------------------------------------
    // Stop
    //----------------------------------------------------------

    async stop() {

        if (!this.running)
            return;

        this.running = false;

        if (this.timer) {

            clearTimeout(
                this.timer
            );

            this.timer = null;

        }

        for (const provider of this.providers.values()) {

            if (
                typeof provider.stop === "function"
            ) {

                await provider.stop();

            }

        }

        this.eventBus.publish(
            "discovery.stopped"
        );

    }

    //----------------------------------------------------------
    // Nächsten Scan planen
    //----------------------------------------------------------

    scheduleNextScan() {

        if (!this.running)
            return;

        const delay = this.getDelayUntilNextScan();

        logger.info(`Nächter Drucker-Scan in ${Math.round(delay / 1000)} Sekunden.`);

        

        this.timer = setTimeout(
            async () => {

                this.timer = null;

                if (!this.running)
                    return;

                try {

                    await this.scan();

                }
                catch (err) {

                    this.onError(
                        null,
                        err
                    );
                    logger.error(this.onError(null, err));

                }
                finally {

                    this.scheduleNextScan();

                }

            },
            delay
        );

    }

    //----------------------------------------------------------
    // Zeit bis zum nächsten Scan
    //----------------------------------------------------------

    getDelayUntilNextScan() {

        const [hour, minute] =
            this.parseTime(
                this.options.time
            );

        const now = new Date();

        const next = new Date(now);

        next.setHours(
            hour,
            minute,
            0,
            0
        );

        // Uhrzeit für heute bereits vorbei
        if (next <= now) {

            next.setDate(
                next.getDate() + 1
            );

        }

        return next.getTime() - now.getTime();

    }

    //----------------------------------------------------------
    // Uhrzeit auswerten
    //----------------------------------------------------------

    parseTime(time) {

        const parts =
            String(time)
                .split(":");

        let hour =
            parseInt(
                parts[0],
                10
            );

        let minute =
            parseInt(
                parts[1],
                10
            );

        if (
            Number.isNaN(hour) ||
            hour < 0 ||
            hour > 23
        ) {

            hour = 3;

        }

        if (
            Number.isNaN(minute) ||
            minute < 0 ||
            minute > 59
        ) {

            minute = 0;

        }

        return [
            hour,
            minute
        ];

    }

    //----------------------------------------------------------
    // Nächste Scanzeit anzeigen
    //----------------------------------------------------------

    nextScanTime() {

        const delay =
            this.getDelayUntilNextScan();

        const next =
            new Date(
                Date.now() + delay
            );

        return next.toLocaleString(
            "de-DE"
        );

    }

    //----------------------------------------------------------
    // Manueller Scan
    //----------------------------------------------------------

    async scan() {

        if (!this.running)
            return;

        // Verhindert parallele Scans
        if (this.scanning) {

            logger.info(
                "Discovery-Scan läuft bereits."
            );

            return {
                running: true,
                scanning: true,
                message: "Scan läuft bereits"
            };

        }

        this.scanning = true;

        try {

            this.eventBus.publish("discovery.scan.started");

            this.emit("scanStarted");

            logger.info("Discovery-Scan gestartet.");

            for (const provider of this.providers.values() ) {

                if (typeof provider.scan === "function") {

                    try {

                        logger.info(`Discovery Provider: ${provider.name}`);

                        await provider.scan();

                    }
                    catch (err) {

                        logger.error(this.onError(provider, err));

                    }

                }

            }

            this.eventBus.publish("discovery.scan.finished");

            this.emit("scanFinished");

            return {
                running: true,
                scanning: false,
                success: true
            };

            

        }
        finally {

            this.scanning = false;

        }

    }

    //----------------------------------------------------------
    // Drucker gefunden
    //----------------------------------------------------------

    async onPrinter(printer) {

        try {

            const saved =
                await this.printerManager
                    .upsertDiscovery(
                        printer
                    );

            this.eventBus.publish(
                "printer.discovered",
                saved
            );

            this.emit(
                "printer",
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
                    provider
                        ? provider.name
                        : null,

                error

            }
        );

        this.emit(
            "error",
            error
        );

        console.error(
            "Discovery Fehler:",
            error
        );

    }

    //----------------------------------------------------------
    // Provider abrufen
    //----------------------------------------------------------

    get(name) {

        return this.providers.get( 
            name
        );

    }

    //----------------------------------------------------------
    // Provider auflisten
    //----------------------------------------------------------

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

            enabled:
                this.options.enabled,

            running:
                this.running,

            scheduled:
                !!this.timer,

            time:
                this.options.time,

            nextScan:
                this.running
                    ? this.nextScanTime()
                    : null,

            scanning:
                this.scanning,

            providers:
                this.list().map(
                    provider => ({

                        name:
                            provider.name,

                        running:
                            provider.running

                    })
                )

        };

    }

}

module.exports = Discovery;