"use strict";

const { EventEmitter } = require("events");

class PrinterManager extends EventEmitter {

    constructor() {

        super();

        this.printers = new Map();

    }

    //----------------------------------------------------------
    // CRUD
    //----------------------------------------------------------

    add(printer) {

        if (this.printers.has(printer.id))
            return false;

        this.printers.set(
            printer.id,
            printer
        );

        this.emit("printerAdded", printer);

        return true;

    }

    remove(id) {

        const printer = this.printers.get(id);

        if (!printer)
            return false;

        this.printers.delete(id);

        this.emit(
            "printerRemoved",
            printer
        );

        return true;

    }

    update(id, values = {}) {

        const printer = this.printers.get(id);

        if (!printer)
            return null;

        Object.assign(
            printer,
            values
        );

        this.emit(
            "printerUpdated",
            printer
        );

        return printer;

    }

    //----------------------------------------------------------
    // Status
    //----------------------------------------------------------

    setStatus(id, status) {

        const printer = this.printers.get(id);

        if (!printer)
            return;

        if (printer.status === status)
            return;

        const oldStatus = printer.status;

        printer.status = status;

        this.emit(
            "printerStatusChanged",
            {
                printer,
                oldStatus,
                newStatus: status
            }
        );

    }

    //----------------------------------------------------------
    // Driver
    //----------------------------------------------------------

    async refresh(id) {

        const printer = this.get(id);

        if (!printer)
            return;

        if (!printer.driver)
            return;

        try {

            const info = await printer.driver.update();

            if (info) {

                this.update(
                    id,
                    info
                );

            }

        }
        catch (err) {

            this.setStatus(
                id,
                "ERROR"
            );

            this.emit(
                "driverError",
                {
                    printer,
                    error: err
                }
            );

        }

    }

    async refreshAll() {

        for (const printer of this.printers.values()) {

            await this.refresh(
                printer.id
            );

        }

    }

    //----------------------------------------------------------
    // Getter
    //----------------------------------------------------------

    get(id) {

        return this.printers.get(id);

    }

    has(id) {

        return this.printers.has(id);

    }

    all() {

        return [...this.printers.values()];

    }

    online() {

        return this.all().filter(

            p => p.status === "ONLINE"

        );

    }

    offline() {

        return this.all().filter(

            p => p.status === "OFFLINE"

        );

    }

    byProtocol(protocol) {

        return this.all().filter(

            p => p.protocol === protocol

        );

    }

    byManufacturer(name) {

        return this.all().filter(

            p => p.manufacturer === name

        );

    }

    byLocation(location) {

        return this.all().filter(

            p => p.location === location

        );

    }

    //----------------------------------------------------------
    // Statistik
    //----------------------------------------------------------

    stats() {

        const printers = this.all();

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

        };

    }

    //----------------------------------------------------------
    // Iterator
    //----------------------------------------------------------

    [Symbol.iterator]() {

        return this.printers.values();

    }

}

module.exports = PrinterManager;