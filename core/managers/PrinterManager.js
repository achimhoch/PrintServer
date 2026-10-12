"use strict";

class PrinterManager {

    constructor(

        printerService,
        driverRegistry,
        eventBus

    ) {
        //super(eventBus);
        this.printerService = printerService;
        this.driverRegistry = driverRegistry;
        this.eventBus = eventBus;

    }

    //----------------------------------------------------------
    //initialize
    //----------------------------------------------------------
    async initialize() {
        return true;
    }

    //----------------------------------------------------------
    //Drucker lesen
    //----------------------------------------------------------

    async get(id) {
        return this.printerService,get(id);
    }



    //----------------------------------------------------------
    // Discovery
    //----------------------------------------------------------

    async upsertDiscovery(printer) {
        //console.log(printer);
        const saved = await this.printerService.upsertDiscovery(printer); 

        this.eventBus.publish(
            "printer.updated",
            saved
        );

        return saved;

    }

    //----------------------------------------------------------
    // Drucker aktualisieren
    //----------------------------------------------------------

    async update(id, values) {

        return this.printerService.update(id, values);

    }
    //----------------------------------------------------------
    //Status setzen
    //----------------------------------------------------------
    async setStatus(id, status) {
        const printer = await this.printerService.get(id);

        if (!printer) {
            return null;
        }

        const oldStatus = printer.status;

        if (oldStatus === status) {
            return printer;
        }

        const online = String(status).toUpperCase() !== "OFFLINE";
        const updated = await this.printerService.update(
            id,
            {
                status,
                online,
                lastSeen: online ? new Date() : printer.lastSeen
            }
        );

        this.eventBus.publish("printerStatusChanged", {
            printer: updated,
            oldStatus,
            newStatus: status
        });

        return updated;

    }
    //----------------------------------------------------------
    //Drucker erreichbar
    //----------------------------------------------------------
    async touch(id) {
        const updated = await this.printerService.update(
            id,
            {
                online: true,
                lastSeen: new Date()
            }
        );

        this.eventBus.publish("printerAlive", updated);

        return updated;
    }

    //----------------------------------------------------------
    // Offline setzen
    //----------------------------------------------------------

    async setOffline(id) {

        return this.printerService.update(id, { 

            online: false

        });

    }
    //----------------------------------------------------------
    //Drucker über Treiber aktualisieren
    //----------------------------------------------------------
    async refresh(id) {
        const printer = await this.printerService.get(id);

        if (!printer) {
            return null;
        }

        let driver = printer.driver;

        if (driver && typeof driver.update === "function") {
            return printer;
        } else {
            const driverName = typeof driver === "string" ? driver : printer.driverName || printer.protocol; 

            if (!driverName) {
                return printer;
            }

            driver = this.driverRegistry.get(driverName);

            if (!driver) {
                throw new Error(`Kein Treiber registriert: ${driverName}`);
            }
        }

        try {
            const info = driver.update(printer);

            if (!info) {
                await this.touch(id);
                return this.printerService.get(id);
            }

            const values = { 
                ...info,
                lastSeen: new Date(),
                online: true
            };

            const updated = await this.printerService.update(id, values);

            if (info.status && info.status !== printer.status) {
                this.eventBus.publish("printerStatusChanged", {
                    printer: updated,
                    oldStatus: printer.status,
                    newStatus: info.status

                });
            }

            this.eventBus.publish("printerUpdated", updated);
            this.eventBus.publish("printerAlive", updated);

            return updated;

        } catch (error) {
            await this.setOffline(id);

            this.eventBus.publish("driverError", {printer, error});
            
            return null;
        }
    }

    //----------------------------------------------------------
    // alle Drucker aktualisieren
    //----------------------------------------------------------
    async refreshAll() {
        const printers = await this.All();

        if (Array.isArray(printers)) {
            return [];
        }

        const results = await Promise.allSettled(printers.map(printer => this.refresh(printer.id)));

        return results;
    }

    //-Stats ---------------------------------------------------
    async stats() {
        return this.statistics();
    }

    //-Online---------------------------------------------------
    async getOnline() {
        return this.printerService.getOnline();
    }

    //-Alle-----------------------------------------------------

    async All() {

        return this.printerService.findAll();

    }

    //----------------------------------------------------------

    async View(id) {
        return this.printerService.findById(id);
    }

    //----------------------------------------------------------

    async online() {

        return this.printerService.findOnline();

    }

    //----------------------------------------------------------

    async statistics() {

        return this.printerService.statistics();

    }

    //----------------------------------------------------------

    async driver(printer) {

        return this.driverRegistry.findDriver(printer);

    }

    //-Drucken--------------------------------------------------

    async print(printerId, job) {

        const printer =
            await this.service.get(printerId);

        if (!printer) {

            throw new Error(
                `Drucker nicht gefunden: ${printerId}`
            );

        }

        let driver =
            printer.driver;

        /*
         * Bereits aufgelöstes Driver-Objekt
         */

        if (
            !driver ||
            typeof driver.print !== "function"
        ) {

            const driverName =
                typeof driver === "string"
                    ? driver
                    : printer.driverName ||
                      printer.protocol;

            driver =
                this.drivers.get(driverName);
        }

        if (!driver) {

            throw new Error(
                `Kein Driver für Drucker ${printerId}`
            );

        }

        return driver.print(
            printer,
            job
        );

    }




}

module.exports = PrinterManager;