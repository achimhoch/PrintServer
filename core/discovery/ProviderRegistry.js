"use strict";
const logger = require("../logging/LogManager").getLogger("ProviderRegistry");


class ProviderRegistry {

    constructor() {

        this.providers = new Map(); 
        this.initialized = false;
    }
    //----------------------------------------------------------
    //Initialisieren
    //----------------------------------------------------------
    async initialize() {
        if (this.initialized) {
            return;
        }

        for (const provider of this.all()) {
            if (typeof provider.initialize === "function") {
                await provider.initialize();
            }
        }

        this.initialized = true;
    }

    //----------------------------------------------------------
    // Provider registrieren
    //----------------------------------------------------------

    register(provider) {
        

        if (!provider)
            throw new Error("Provider is required.");

        if (!provider.name)
            throw new Error("Provider has no name.");

        if (this.providers.has(provider.name)) {
            throw new Error(`Provider '${provider.name}' already registered.`);
        }

        if (this.initialized) {
            throw new Error("ProviderRegistry is already initialized. " + "Register Provider before initialize.");
        }

        this.providers.set(

            provider.name,

            provider

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
    // Provider liefern
    //----------------------------------------------------------

    get(name) {

        return this.providers.get(name);

    }

    //----------------------------------------------------------
    // Existiert?
    //----------------------------------------------------------

    has(name) {

        return this.providers.has(name);

    }

    //----------------------------------------------------------
    // Alle Provider
    //----------------------------------------------------------

    all() {

        return [

            ...this.providers.values()

        ];

    }

    //----------------------------------------------------------
    // Aktivierte Provider
    //----------------------------------------------------------

    enabled() {

        return this.all().filter(provider => provider.enabled !== false);

    }

    //----------------------------------------------------------
    // Laufende Provider
    //----------------------------------------------------------

    running() {

        return this.all()

            .filter(

                provider => provider.running === "true"

            );

    }

    //----------------------------------------------------------
    // Provider nach Typ
    //----------------------------------------------------------

    byType(type) {

        return this.all()

            .filter(

                provider => provider.type === type

            );

    }

    //----------------------------------------------------------
    // Provider starten
    //----------------------------------------------------------

    async startAll() {

        for (const provider of this.enabled()) {

            if (typeof provider.start !== "function") {
                continue;
            }

            await provider.start();

        }

    }

    //----------------------------------------------------------
    // Provider stoppen
    //----------------------------------------------------------

    async stopAll() {

        for (const provider of this.running()) {

            if (typeof provider.stop !== "function") {
                continue;
            }

            await provider.stop();

        }

    }

    //----------------------------------------------------------
    //Einzelnen Provider starten
    //----------------------------------------------------------

    async start(name) {
        const provider = this.get(name);
        if (!provider) {
            return false;
        }

        if (provider.enabled === false) {
            return false;
        }

        await provider.start();

        return true;
    }

     //----------------------------------------------------------
    //Einzelnen Provider stoppen
    //----------------------------------------------------------

    async stop(name) {
        const provider = this.get(name);
        if (!provider) {
            return false;
        }

        await provider.stop();

        return true;
    }

    //----------------------------------------------------------
    // Aktivieren
    //----------------------------------------------------------

    enable(name) {

        const provider = this.get(name);

        if (!provider)
            return false;

        provider.enabled = true;

        return true;

    }

    //----------------------------------------------------------
    // Deaktivieren
    //----------------------------------------------------------

    disable(name) {

        const provider = this.get(name);

        if (!provider)
            return false;

        provider.enabled = false;

        return true;

    }

    //----------------------------------------------------------
    // Provider neu laden
    //----------------------------------------------------------

    async restart(name) {

        const provider = this.get(name);

        if (!provider)
            return;

        if (provider.running) {
            await provider.stop();
        }

        if (provider.enabled !== false) {
            await provider.start();
        }

        return true;

    }

    //----------------------------------------------------------
    // Scan aller Provider
    //----------------------------------------------------------

    async scan() {

        const providers = this.enabled();
        if (providers.length === 0) {
            return [];
        }

       const results = await Promise.allSettled(
            providers.map(async provider => {
                if (typeof provider.scan !== "function") {
                    return {
                        provider: provider.name,
                        skipped: true
                    };
                }

                try {

                    const result = await provider.scan();

                    return {
                        provider: provider.name,
                        result
                    };

                }
                catch (error) {
                    logger.error(`Provider '${provider.name}' ` + `ScanFehler:`);
                    logger.error(error);
                    throw error;
                }
                
            })
        );
    //Fehler auswerten
        for (const result of results) {
            if (result.status === "rejected") {
                logger.error("Provider Scan rejected:");
                logger.error(result.reason);
            }
        }

        return results;

    }

    //----------------------------------------------------------
    // Anzahl
    //----------------------------------------------------------

    count() {

        return this.providers.size;

    }

    //----------------------------------------------------------
    // Statistik
    //----------------------------------------------------------

    statistics() {

        const providers = this.all();

        return {

            total: providers.length,

            enabled: providers.filter(

                p => p.enabled !== false

            ).length,

            running: providers.filter(

                p => p.running === true

            ).length,

            disabled: providers.filter(

                p => p.enabled === false

            ).length,

            initialize: this.initialized


        };

    }

    //----------------------------------------------------------
    // Status
    //----------------------------------------------------------

    status() {

        return this.all().map(

            provider => ({

                name: provider.name,

                type: provider.type,

                enabled: provider.enabled !== false,

                running: provider.running === true,

                lastScan: provider.lastScan || null,

                nextScan: provider.nextScan || null,

                scanCount: provider.scanCount || 0,

                discovered: provider.discovered || 0,

                lost: provider.lost || 0,

                errors: provider.errors || 0

            })

        );

    }

    //----------------------------------------------------------
    // Zurücksetzen
    //----------------------------------------------------------

    clear() {

        if (this.initialized) {
            throw new Error("Eine nitialisierrte ProduktRegistry kann nicht gelöscht werden");
        }

        this.providers.clear();

    }

}

module.exports = ProviderRegistry;