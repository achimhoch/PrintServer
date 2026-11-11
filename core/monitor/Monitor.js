"use strict";

const EventEmitter = require("events");
const logger = require("../logging/LogManager").getLogger("Monitor"); 

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

        this.statistics = {

            cycles: 0,

            printers: 0,

            online: 0,

            offline: 0,

            idle: 0,

            busy: 0,

            errors: 0,

            lastRun: null,

            lastDuration: 0

        }

    }

    //----------------------------------------------------------
    // Initialisieren
    //----------------------------------------------------------

    async initialize() {
        return true;
    }

    //----------------------------------------------------------
    // Start
    //----------------------------------------------------------

    async start() {

        if (this.running)
            return;

        this.running = true;

         this.eventBus.publish("monitorStarted",  { interval: this.interval, timestamp: new Date() });

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

        this.statistics.cycles++;
        this.statistics.lastRun = new Date();

        try {
            this.eventBus.publish("monitorTick", { timestamp: new Date() });

            const printers = await this.printerManager.All();

            this.statistics.printers = printers.length;
            this.statistics.online = 0;
            this.statistics.offline = 0;
            this.statistics.idle = 0;
            this.statistics.busy = 0;

            const results = await Promise.allSettled(printers.map(printer => this.checkPrinter(printer)));

            for (const result of results) {

                if (result.status === "rejected") {
                    this.statistics.errors++;
                }
            }

            this.statistics.lastDuration = Date.now() - startedAt;

            this.eventBus.publish("monitorCompleted", {
                timestamp: new Date(),
                duration: this.statistics.lastDuration,
                statistics: { ...this.statistics }
            });

            return results;

        } catch (error) {

            this.statistics.errors++;
            this.handleError(error);

        } finally {

            this.busy = false;

        }

        /*try {
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
        }*/
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

    }*/

    //----------------------------------------------------------
    // Drucker prüfen
    //----------------------------------------------------------

    async checkPrinter(printer) {

        if (!printer) {
            return null;
        }

        try {

            const driver = this.printerManager.getDriver ? this.printerManager.getDriver(printer) : null;

            if (!driver || typeof driver.update !== "function") {
                return null;
            }

            const info = await driver.update(printer);

            if (!info) {
                throw new Error(`Keine Statusantwort vom Drucker ${printer.id}`);
            }

            let status = info.status;

            if (!status) {
                status = "IDLE";
            }

            status = String(status).toUpperCase();

            if (status === "PRINTING" || status === "PROCESSING" || status === "BUSY") {
                status = "BUSY";
            } else if (status === "IDLE" || status === "READY" || status === "ONLINE") {
                status = "IDLE";
            } else if (status === "OFFLINE") {
                status = "OFFLINE";
            } else {
                status = "IDLE";
            }

            const values = { ...info };

            delete values.status;
            delete values.online;
            delete values.busy;

            await this.printerManager.update(printer.id, values);

            await this.printerManager.setStatus(printer.id, status);

            if (status === "OFFLINE") {
                this.statistics.offline++;
            } else {
                this.statistics.online++;

                if (status === "BUSY") {
                    this.statistics.busy++;
                } else {
                    this.statistics.idle++;
                }
            }

            this.eventBus.publish("printerMonitored", {
                printerId: printer.id,
                status,
                timestamp: new Date()
            });

            return {
                printerId: printer.id,
                status
            };

        } catch (error) {
            await this.printerManager.setStatus(printer.id, "OFFLINE");

            this.statistics.offline++;

            this.eventBus.publish("driverError", {
                printer, 
                error
            });

            throw error;
        }

        /*try {

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

        }*/

    }

    //----------------------------------------------------------
    //Drucker sofort aktualisieren
    //----------------------------------------------------------
    async refreshPrinter(id) {
        const printer = await this.printerManager.get(id);

        if (!printer) {
            return false;
        }

        await this.checkPrinter(printer);

        return true;
    }

    //----------------------------------------------------------
    //Alle Drucker sofort aktualisieren
    //----------------------------------------------------------
    async refreshAll() {

        if (this.busy) {
            return false;
        }

        return this.tick();
    }
    /*async refreshAll() {
        return this.printerManager.refreshAll();
    }*/


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

        const printersStats = await this.printerManager.stats();

        return {
            running: this.running,
            busy: this.busy,
            interval: this.interval,
            statistics: { ...this.statistics },
            //lastTick: new Date(),
            printers: printersStats

        };

    }

    //----------------------------------------------------------
    //Fehlerbehandlung
    //----------------------------------------------------------
    handleError(error) {
        this.eventBus.publish("monitorError", {error});
        logger.error(error);
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