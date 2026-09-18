"use strict";

const EventEmitter = require("events");
const ProviderRegistry = require("./ProviderRegistry");
const { Error } = require("sequelize");
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
        this.registry = new ProviderRegistry(); 

        this.options = {

            enabled: true,

            interval: 30000,

            autoStart: true,

            scanOnStart: false,

            ...options

        };

        this.providerListeners = new Map();

        this.running = false;
        this.scanning = false;
        this.initialized = false;

        this.timer = null;

        this.scanPromise = null;
        this.lastScan = null;
        this.nextScan = null;
        this.scanCount = 0;

        

    }

    //----------------------------------------------------------
    // Initialisieren
    //----------------------------------------------------------

    async initialize() {

        if (this.initialized) {
            return;
        }

        logger.info("Initialisiere Discovery....");
    // Echte Provider-Instanzen
        if (Array.isArray(this.options.providers)) {
            for (const provider of this.options.providers) {
                if (provider && provider.name && !this.registry.has(provider.name)) {
                    this.registry.register(provider);
                }
            }
        }
    // Provider Events
        for (const provider of this.registry.all()) {
            this.attachProvider(provider);
        }
    //Provider initialisieren
        await this.registry.initialize();

        this.initialized = true;
        logger.info("Discovery initialisiert.")

        this.eventBus.publish("discovery.initialized", this.status());

    }

    //----------------------------------------------------------
    //Provider Events verbinden
    //----------------------------------------------------------

    attachProvider(provider) {
        
        if (this.providerListeners.has(provider.name)) {
            return;
        }

        const printer = printer => this.onPrinter(printer);
        const printerLost = printer => this.onPrinterLost(printer);
        const error = error => this.onError(provider, error);

        provider.on("printer", printer);
        provider.on("printerLost", printerLost);
        provider.on("error", error);

        this.providerListeners.set(provider.name, {
            printer,
            printerLost,
            error
        });
    }

    //----------------------------------------------------------
    // Provider registrieren
    //----------------------------------------------------------

    register(provider) {

        if (this.initialized)
            throw new Error("Kann den Provider nicht registrieren nach" + "Discovery.initalize().");

        this.registry.register(provider);

        this.attachProvider(provider);

        logger.info("Provider registriert");

        return provider;

    }

    //----------------------------------------------------------
    // Provider entfernen
    //----------------------------------------------------------

    unregister(name) {

        const provider = this.registry.get(name);

        if (!provider)
            return false;

        const listeners = this.providerListeners.get(name);

        if (listeners) {
            provider.off("printer", listeners.printer);
            provider.off("printerLost", listeners.printerLost);
            provider.off("error", listeners.error);
            this.providerListeners.delete(name);
        }

        return this.registry.unregister(name);

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

        if (!this.initialized) {
            await this.initialize();
        }

        this.running = true;

        this.eventBus.publish("discovery.started", this.status());

    // Provider starten-----------------------------------------
        await this.registry.startAll();

    //Zeitplan starten------------------------------------------
        this.scheduleNextScan();

    //Optionaler Scan beim Start--------------------------------

        if (this.options.scanOnStart) {
            await this.runScan("startup");
        }

       
    }

    //----------------------------------------------------------
    // Stop
    //----------------------------------------------------------

    async stop() {

        if (!this.running)
            return;

        this.running = false;
    
    //Timer entfernen-------------------------------------------

        this.clearTimer();
        this.nextScan = null;

    //Provider stoppen------------------------------------------

        await this.registry.stopAll();


        this.eventBus.publish("discovery.stopped", this.status());
        logger.info("Discovery gestoppt.");
    

    }

    //----------------------------------------------------------
    // Nächsten Scan planen
    //----------------------------------------------------------

    scheduleNextScan() {

        this.clearTimer();

        if (!this.running)
            return;

        if (!this.options.interval) 
            return

        const interval = Math.max(1000, Number(this.options.interval));
        this.nextScan = new Date(Date.now() + interval);

        logger.info(`Nächter Drucker-Scan in ${this.nextScan}`);

    //Provider status aktualisieren----------------------------- 

        for (const provider of this.registry.all()) {
            provider.nextScan = this.nextScan;
        }

        this.timer = setTimeout(
            async () => {

                this.timer = null;

                if (!this.running)
                    return;

                try {

                    await this.runScan("scheuled");

                }
                catch (err) {

                    this.onError(
                        null,
                        err
                    );
                    logger.error(this.onError(null, err));

                }
                finally {

                    if (this.running) {
                        this.scheduleNextScan();
                    }

                }

            },
            interval
        );

    }

    //----------------------------------------------------------
    // Timer entfernen
    //----------------------------------------------------------
    clearTimer() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }
   

    //----------------------------------------------------------
    // zeitgesteuerter Scan / interner Scan
    //----------------------------------------------------------

    async runScan(reason = "scheduled") {
        if (!this.running) {
            throw new Error("Discovery läuft nicht...");
        }

    // Kein paraller Scan---------------------------------------
    
        if (this.scanning) {
            return {
                started: false,
                running: true,
                reason,
                message: "Scan läuft bereits."
            };
        }

        this.scanning = true;
        this.scanCount++;

        const startedAt = new Date();
        this.lastScan = startedAt;

    //Wichtig: Bei einem manuellen Scan wird nextScan nicht verändert.

        const scheduledNextScan = this.lastScan;
        this.eventBus.publish("discovery.scan.started", {
            reason,
            startedAt,
            scanCount: this.scanCount,
            nextScan: scheduledNextScan
        });

        try {
            const results = await this.registry.scan();
            const finishedAt = new Date();
            logger,info("Scan benedet");
            this.eventBus.publish("discovery.scan.finished", {
                reason,
                startedAt,
                finishedAt,
                scanCount: this.scanCount,
                nextScan: this.nextScan,
                results
            });

            return {
                started: true,
                reason,
                startedAt,
                finishedAt,
                scanCount: this.scanCount,
                nextScan: this.nextScan,
                results
            };

        } catch (error) {
            this.onError(null, error);
            throw error;

        } finally {
            this.scanning = false;
        }
    } 

    //----------------------------------------------------------
    // Manueller Scan
    //----------------------------------------------------------

    async manualScan() {
        if (!this.running) {
            const error = new Error("Discovery läuft nicht...");
            error.code = "DISOVERY_NOT_RUNNING";
             logger.error(error);
            throw error;
        }

        if (this.scanning) {
            const error = new Error("Scan läuft bereits...");
            error.code = "DISCOVERY_RUN_SCANNING";
             logger.error(error);
            throw error;
           
        }
    //runScan verändert nextScan nicht--------------------------
        return this.runScan("manual");
        
    }

    //----------------------------------------------------------
    //Scan
    //----------------------------------------------------------

    /*async scan(options = {}) {

        if (!this.running) {
            const error = new Error("Discovery läuft nicht");
            error.code = "DISCOVERY_NOT_RUNNING";
            throw error;

            
        }

        // Verhindert parallele Scans
        if (this.scanning) {

            /*logger.info(
                "Discovery-Scan läuft bereits."
            );

            return {
                running: true,
                scanning: true,
                message: "Scan läuft bereits"
            };

            const error = new Error("Scan läuft bereits.");
            error.code = "DISCOVERY_SCAN_RUNNING";
            throw error;

        }

        this.scanning = true;

        this.lastScanAt = new Date();
        this.lastScanError = null;
        this.scanCount ++;
        const manual = options.manual === true;

      

            this.eventBus.publish("discovery.scan.started", {
                manual,
                timestamp: this.lastScanAt.toISOString(),
                scanCount: this.scanCount
            });

            //this.emit("scanStarted");

            logger.info(`Discovery-Scan gestartet${manual ? " (manual)" : ""}.`);

            try {

                const providers = this.getEnabledProviders();
                logger.info(`${providers.length} Provider laufen..`);

                const results = await Promise.allSettled(
                    providers.map(provider => this.runProvider(provider))
                );

                const summary = {
                    providers: providers.length,
                    successful: results.filter(result => result.status === "fulfilled").length,
                    failed: results.filter(result => result.status === "rejected").length,
                    manual,
                    timestamp: new Date().toISOString()
                };

                for (let i=0; i < results.length; i++) {

                    const result = results[i];
                    if (result.status === "rejected") {
                        const provider = providers[i];
                        logger.error(`Discovery Provider ${provider.name} || ${provider.constructor.name} failed: ${result.reason?.message || result.reason}`);

                    }
                }

                this.lastScanFinishedAt = new Date();
                this.eventBus.publish("discovery scan finished", summary);
                logger.info(`Discovery-Scan ${summary.successful} erfolgreich, ${summary.failed} nicht erfolgreich`);

                return summary;

            } catch (error) {

                this,this.lastScanError = this.error.message;
                this.eventBus.publish("discovery.scan.error", {
                    manual,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
                logger.error(`Discovery-Scan fehlgeschlagen: ${error.message}`);
                throw error;

            } finally {
                this.scanning = false;
            }

            /*for (const provider of this.providers.values() ) {

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

    }*/
   

    

    //----------------------------------------------------------
    // Drucker gefunden
    //----------------------------------------------------------

    async onPrinter(printer) {

        try {

            const saved = await this.printerManager.upsertDiscovery(printer);

            this.eventBus.publish("printer.discovered", saved);

        }
        catch (err) {

            logger.error(this.onError(null, err));

        }

    }

    //----------------------------------------------------------
    // Drucker verschwunden
    //----------------------------------------------------------

    async onPrinterLost(printer) {

        try {

            await this.printerManager.setOffline(printer.id || printer.ip);

            this.eventBus.publish("printer.lost", printer);

        }
        catch (err) {

            logger.error(this.onError(null, err));

        }

    }

    //----------------------------------------------------------
    // Fehler
    //----------------------------------------------------------

    onError(provider, error) {

        this.eventBus.publish("discovery.error", {

            provider: provider ? provider.name : null,
            error: error instanceof Error ? {
                name: error.name,
                message: error.message
            } : error

        
        });

       

        logger.error("Discovery Fehler:", error);

    }

     //----------------------------------------------------------
    //Provider ausführen
    //----------------------------------------------------------

    getProvider(name) {
        return this.registry.get(name);
    }

    //----------------------------------------------------------
    // Provider
    //----------------------------------------------------------

    getProviders() {
        return this.registry.all();
    }

    
    
    //----------------------------------------------------------
    // Status
    //----------------------------------------------------------

    status() {

        return {

            enabled: this.options.enabled !== false,

            initialized: this.initialized,

            running: this.running,

            scanning: this.scanning,

            interval: this.options.interval, 

            lastScan: this.lastScan,

            nextScan: this.nextScan,

            scanCount: this.scanCount,

            providers: this.registry.status(),

            statistics: this.registry.statistics()
        };

    }

    //---------------------------------------------------
    //Statistik
    //---------------------------------------------------

    statistics() {
        return { 
            running: this.running, 
            scanning: this.scanning, 
            interval: this.options.interval, 
            lastScan: this.lastScan, 
            nextScan: this.nextScan,
            scanCount: this.scanCount, 
            providers: this.registry.statistics() 
        };
    }

}

module.exports = Discovery;