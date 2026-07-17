"use strict";

const EventEmitter = require("events");

class DiscoveryProvider extends EventEmitter {

    constructor(options = {}) {

        super();

        //------------------------------------------------------
        // Metadaten
        //------------------------------------------------------

        this.name = options.name || this.constructor.name;

        this.type = options.type || "generic";

        this.version = options.version || "2.0";

        //------------------------------------------------------
        // Status
        //------------------------------------------------------

        this.enabled = options.enabled !== false;

        this.running = false;

        //------------------------------------------------------
        // Discovery
        //------------------------------------------------------

        this.interval = options.interval || 30000;

        this.timeout = options.timeout || 5000;

        this.lastScan = null;

        this.nextScan = null;

        //------------------------------------------------------
        // Statistik
        //------------------------------------------------------

        this.discovered = 0;

        this.lost = 0;

        this.errors = 0;

        this.scanCount = 0;

        //------------------------------------------------------
        // Cache
        //------------------------------------------------------

        this.cache = new Map();

        //------------------------------------------------------
        // Konfiguration
        //------------------------------------------------------

        this.options = {

            ...options

        };

    }

    //----------------------------------------------------------
    // Initialisieren
    //----------------------------------------------------------

    async initialize() {

    }

    //----------------------------------------------------------
    // Start
    //----------------------------------------------------------

    async start() {

        if (this.running)
            return;

        this.running = true;

        this.emit(

            "started",

            this

        );

    }

    //----------------------------------------------------------
    // Stop
    //----------------------------------------------------------

    async stop() {

        if (!this.running)
            return;

        this.running = false;

        this.emit(

            "stopped",

            this

        );

    }

    //----------------------------------------------------------
    // Discovery
    //----------------------------------------------------------

    async scan() {

        if (!this.running)
            return [];

        this.scanCount++;

        this.lastScan = new Date();

        this.nextScan = new Date(

            Date.now() + this.interval

        );

        return [];

    }

    //----------------------------------------------------------
    // Drucker gefunden
    //----------------------------------------------------------

    found(printer) {

        this.discovered++;

        this.cache.set(

            printer.id || printer.ip,

            printer

        );

        this.emit(

            "printer",

            printer

        );

    }

    //----------------------------------------------------------
    // Drucker verloren
    //----------------------------------------------------------

    lostPrinter(printer) {

        this.lost++;

        this.cache.delete(

            printer.id || printer.ip

        );

        this.emit(

            "printerLost",

            printer

        );

    }

    //----------------------------------------------------------
    // Fehler
    //----------------------------------------------------------

    error(err) {

        this.errors++;

        this.emit(

            "error",

            err

        );

    }

    //----------------------------------------------------------
    // Cache
    //----------------------------------------------------------

    has(ip) {

        return this.cache.has(ip);

    }

    get(ip) {

        return this.cache.get(ip);

    }

    remove(ip) {

        this.cache.delete(ip);

    }

    clear() {

        this.cache.clear();

    }

    getPrinters() {

        return [

            ...this.cache.values()

        ];

    }

    //----------------------------------------------------------
    // Statistik
    //----------------------------------------------------------

    statistics() {

        return {

            provider: this.name,

            type: this.type,

            running: this.running,

            enabled: this.enabled,

            scanCount: this.scanCount,

            discovered: this.discovered,

            lost: this.lost,

            errors: this.errors,

            cached: this.cache.size,

            lastScan: this.lastScan,

            nextScan: this.nextScan

        };

    }

    //----------------------------------------------------------
    // Status
    //----------------------------------------------------------

    status() {

        return {

            name: this.name,

            type: this.type,

            running: this.running,

            enabled: this.enabled,

            lastScan: this.lastScan,

            cache: this.cache.size

        };

    }

}

module.exports = DiscoveryProvider;