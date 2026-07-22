"use strict";

class ProviderRegistry {

    constructor() {

        this.providers = new Map();

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
            throw new Error(

                `Provider '${provider.name}' already registered.`

            );

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

        return this.all()

            .filter(

                provider => provider.enabled

            );

    }

    //----------------------------------------------------------
    // Laufende Provider
    //----------------------------------------------------------

    running() {

        return this.all()

            .filter(

                provider => provider.running

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

            await provider.start();

        }

    }

    //----------------------------------------------------------
    // Provider stoppen
    //----------------------------------------------------------

    async stopAll() {

        for (const provider of this.running()) {

            await provider.stop();

        }

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

        if (provider.running)

            await provider.stop();

        if (provider.enabled)

            await provider.start();

    }

    //----------------------------------------------------------
    // Scan aller Provider
    //----------------------------------------------------------

    async scan() {

        await Promise.all(

            this.enabled().map(

                provider => provider.scan()

            )

        );

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

                p => p.enabled

            ).length,

            running: providers.filter(

                p => p.running

            ).length,

            disabled: providers.filter(

                p => !p.enabled

            ).length

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

                enabled: provider.enabled,

                running: provider.running,

                lastScan: provider.lastScan,

                discovered: provider.discovered,

                errors: provider.errors

            })

        );

    }

    //----------------------------------------------------------
    // Zurücksetzen
    //----------------------------------------------------------

    clear() {

        this.providers.clear();

    }

}

module.exports = ProviderRegistry;