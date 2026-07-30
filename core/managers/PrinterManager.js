"use strict";

class PrinterManager {

    constructor(

        printerService,
        driverRegistry,
        eventBus

    ) {

        this.printerService = printerService;
        this.driverRegistry = driverRegistry;
        this.eventBus = eventBus;

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

    async updateStatus(id, values) {

        return this.printerService.update(id, values);

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

    async all() {

        return this.printerService.findAll();

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

    driver(printer) {

        return this.driverRegistry.findDriver(printer);

    }

}

module.exports = PrinterManager;