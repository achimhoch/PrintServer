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

        this.options = {

            interval: 10000,

            autoStart: true,

            ...options

        };

        this.running = false;

        this.timer = null;

        this.statistics = {

            cycles: 0,

            printers: 0,

            online: 0,

            offline: 0,

            busy: 0,

            errors: 0,

            lastRun: null

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

        await this.run();

        this.timer = setInterval(

            () => this.run(),

            this.options.interval

        );

        this.eventBus.publish(

            "monitor.started"

        );

    }

    //----------------------------------------------------------
    // Stop
    //----------------------------------------------------------

    async stop() {

        if (!this.running)
            return;

        clearInterval(this.timer);

        this.timer = null;

        this.running = false;

        this.eventBus.publish(

            "monitor.stopped"

        );

    }

    //----------------------------------------------------------
    // Überwachung
    //----------------------------------------------------------

    async run() {

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

    }

    //----------------------------------------------------------
    // Statistik
    //----------------------------------------------------------

    stats() {

        return {

            ...this.statistics,

            running: this.running

        };

    }

    //----------------------------------------------------------
    // Status
    //----------------------------------------------------------

    status() {

        return {

            running: this.running,

            interval: this.options.interval,

            lastRun: this.statistics.lastRun

        };

    }

}

module.exports = Monitor;