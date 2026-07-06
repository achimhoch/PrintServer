"use strict";

const { EventEmitter } = require("events");

class PrinterManager extends EventEmitter {

    constructor(repository, driverRegistry, eventBus) {

        super();

        //this.printers = new Map();
        this.repository = repository;
        this.driverRegistry = driverRegistry;
        this.eventBus = eventBus;
        //console.log(this.printers);
        

    }

    //----------------------------------------------------------
    // CRUD
    //----------------------------------------------------------

    async add(printer) {

        const exist = await this.repository.has(printer.id);

        if (exist)
            return false;

        await this.repository.add(printer);

        /*this.printers.set(
            printer.id,
            printer
        );

        this.emit("printerAdded", printer);*/
        this.eventBus.publish("printerAdded", printer);

        return true;

    }

    async remove(id) {

        const printer = await this.repository.get(id);

        if (!printer)
            return false;

        await this.repository.remove(id);

        this.eventBus.publish(printer);

        return true;

    }

    async update(id, values = {}) {

        //const printer = this.printer.get(id);
        const printer = await this.repository.update(id);

        if (!printer)
            return null;

        printer.lastUpdate = new Date();
        /*Object.assign(
            printer,
            values
        );

        this.emit(
            "printerUpdated",
            printer
        );*/

        this.eventBus.publish("printerUpdate, printer");

        return printer;

    }

    //----------------------------------------------------------
    // Status
    //----------------------------------------------------------

    async setStatus(id, status) {

        //const printer = this.printers.get(id);
        const printer = this.repository.get(id);

        if (!printer)
            return;

        if (printer.status === status)
            return;

        const oldStatus = printer.status;

        printer.status = status;

        /*this.emit(
            "printerStatusChanged",
            {
                printer,
                oldStatus,
                newStatus: status
            }
        );*/
        this.eventBus.publish("printerStatusChanged", {printer, oldStatus, newStatus: status});

        return printer;

    }

    //----------------------------------------------------------
    // Driver
    //----------------------------------------------------------

    async refresh(id) {

        const printer = await this.repository.get(id);

        if (!printer)
            return;

        if (!printer.driver)
            return;

        try {

            const info = await printer.driver.update();

            if (info) {

               await this.update(
                    id,
                    info
                );

            }

            if (info.status) {
                await this.setStatus(id, info.status);
            }

        }
        catch (err) {

            await this.setStatus(
                id,
                "ERROR"
            );

            printer.incrementErrors();

            /*this.emit(
                "driverError",
                {
                    printer,
                    error: err
                }
            );*/
            this.eventBus.publish("driverError", {printer, error: err});

        }

    }

    async refreshAll() {
        const printers = await this.repository.all();

        //for (const printer of this.printers.values()) {
        for (const printer of printers) {

            await this.refresh(
                printer.id
            );

        }

    }

    //----------------------------------------------------------
    // Getter
    //----------------------------------------------------------

    async get(id) {

        return this.repository.get(id);

    }

    async has(id) {

        return this.repository.has(id);

    }

    async all() {

        return this.repository.all();;

    }

    async online() {

        return this.repository.findOnline();

    }

    async offline() {

        return this.repository.findOffline();

    }

    async busy() {
        this.repository.findBusy();
    }

    async idle() {
        this.repository.findIdle();
    } 

    async byProtocol(protocol) {

        return this.repository.findByProtocol(protocol);
    }

    async byManufacturer(name) {

        return this.repository.findByManufacturer(name)
    }

    async byLocation(location) {

        return this.repository.findByLocation(location);
    }

    async byStatus(status) {

        return this.repository.findByStatus(status);

    }

    //----------------------------------------------------------
    // Statistik
    //----------------------------------------------------------

    async stats() {

        /*const printers = this.all();

        return {

            total: printers.length,

            online: printers.filter(

                p => p.status === "ONLINE"

            ).length,

            offline: printers.filter(

                p => p.status === "OFFLINE"

            ).length,

            printing: printers.filter(

                p => p.status === "PRINTING"

            ).length,

            error: printers.filter(

                p => p.status === "ERROR"

            ).length

        };*/
        return this.repository.stats();

    }

    //----------------------------------------------------------
    // Iterator
    //----------------------------------------------------------

    [Symbol.iterator]() {

        return this.printers.values();

    }

}

module.exports = PrinterManager;