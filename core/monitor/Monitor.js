"use strict";

const EventEmitter = require("events");

class Monitor extends EventEmitter { 

    constructor(

        printerManager,

        eventBus,

        options = {}

    ) {

        super();

        this.printerManager = printerManager;

        this.eventBus = eventBus;

        /*this.options = {

            interval: 10000,

            autoStart: true,

            ...options

        };*/

        this.interval = Number(options.interval) || 15000; 

        this.running = false;

        this.timer = null;

        this.busy = false;

        /*this.statistics = {

            cycles: 0,

            printers: 0,

            online: 0,

            offline: 0,

            busy: 0,

            errors: 0,

            lastRun: null

        };*/

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

         this.eventBus.publish(

            "monitorStarted", 
            {
                interval: this.interval
            }

        );

        this.tick().catch(error => this.handleError(error));

        this.timer = setInterval(

            () => {
                this.tick().catch(error => this.handleError(error));
            },
            this.interval

        );

       

    }

    //----------------------------------------------------------
    // Stop
    //----------------------------------------------------------

    async stop() {

        if (this.timer) {
            clearInterval(this.timer);

            this.timer = null;
        }

        if (!this.running)
            return;

        this.running = false;

        this.eventBus.publish(

            "monitor.stopped", {}

        );

    }

    //----------------------------------------------------------
    // tick
    //----------------------------------------------------------

    async tick() {

        if (!this.running) {
            return;
        }

        if (this.busy) {
            return;
        }

        this.busy = true;

        const startedAt = Date.now();

        try {
            this.eventBus.publish("monitorTick", {timestamp: new Date()});

            const results = await this.printerManager.refreshAll();
            const duration = Date.now() - startedAt;

            this.eventBus.publish("monitorCompleted", {
                timestamp: new Date(),
                duration,
                results
            });

            return results;
        }
        finally {
            this.busy = false;
        }
    }

    //----------------------------------------------------------
    // Überwachung
    //----------------------------------------------------------

    /*async run() {

        this.statistics.cycles++;

        this.statistics.lastRun = new Date();

        try {

            const printers =

                await this.printerManager.all();

            this.statistics.printers =

                printers.length;

            this.statistics.online = 0;

            this.statistics.offline = 0;

            this.statistics.busy = 0;

            for (const printer of printers) {

                await this.checkPrinter(

                    printer

                );

            }

            this.emit(

                "cycle",

                this.statistics

            );

        }
        catch (err) {

            this.statistics.errors++;

            this.eventBus.publish(

                "monitor.error",

                err

            );

        }

    }

    //----------------------------------------------------------
    // Drucker prüfen
    //----------------------------------------------------------

    async checkPrinter(printer) {

        try {

            const state =

                await this.printerManager.status(

                    printer.id

                );

            if (state.online)

                this.statistics.online++;

            else

                this.statistics.offline++;

            if (state.busy)

                this.statistics.busy++;

            this.eventBus.publish(

                "printer.health",

                {

                    printer,

                    state

                }

            );

        }
        catch (err) {

            this.statistics.errors++;

            this.eventBus.publish(

                "printer.error",

                {

                    printer,

                    error: err.message

                }

            );

        }

    }*/

    //----------------------------------------------------------
    //Drucker sofort aktualisieren
    //----------------------------------------------------------
    async refreshAll(id) {
        return this.printerManager.refresh(id);
    }

    //----------------------------------------------------------
    //Alle Drucker sofort aktualisieren
    //----------------------------------------------------------
    async refreshAll() {
        return this.printerManager.refreshAll();
    }

    //----------------------------------------------------------
    //Monitor-Status
    //----------------------------------------------------------
    isRunning() {
        return this.running;
    }

    //----------------------------------------------------------
    // Statistik
    //----------------------------------------------------------

    async stats() {

        const printers = await this.printerManager.stats();

        return {
            running: this.running,
            busy: this.busy,
            interval: this.interval,
            lastTick: new Date(),
            printers

        };

    }

    //----------------------------------------------------------
    //Fehlerbehandlung
    //----------------------------------------------------------
    handleError(error) {
        this.eventBus("monitorError", {error});
    }

    //----------------------------------------------------------
    // Status
    //----------------------------------------------------------

    /*status() {

        return {

            running: this.running,

            interval: this.options.interval,

            lastRun: this.statistics.lastRun

        };

    }*/

}

module.exports = Monitor;