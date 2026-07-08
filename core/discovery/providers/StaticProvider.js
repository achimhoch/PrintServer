"use strict";

const { EventEmitter } = require("events");

class StaticProvider extends EventEmitter {

    constructor(printers = []) {

        super();

        this.printers = new Map();

        for (const printer of printers) {

            this.printers.set(
                printer.id,
                printer
            );

        }

        this.running = false;

    }

    //----------------------------------------------------------
    // Start
    //----------------------------------------------------------

    async start() {

        if (this.running)
            return;

        this.running = true;

        for (const printer of this.printers.values()) {

            this.emit(
                "printerFound",
                printer
            );

        }

    }

    //----------------------------------------------------------
    // Stop
    //----------------------------------------------------------

    async stop() {

        this.running = false;

    }

    //----------------------------------------------------------
    // Scan
    //----------------------------------------------------------

    async scan() {

        if (!this.running)
            return;

        for (const printer of this.printers.values()) {

            this.emit(
                "printerUpdated",
                printer
            );

        }

    }

    //----------------------------------------------------------
    // Verwaltung
    //----------------------------------------------------------

    add(printer) {

        this.printers.set(
            printer.id,
            printer
        );

        if (this.running) {

            this.emit(
                "printerFound",
                printer
            );

        }

    }

    remove(id) {

        const printer = this.printers.get(id);

        if (!printer)
            return false;

        this.printers.delete(id);

        this.emit(
            "printerLost",
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

    get(id) {

        return this.printers.get(id);

    }

    has(id) {

        return this.printers.has(id);

    }

    all() {

        return [...this.printers.values()];

    }

    clear() {

        this.printers.clear();

    }

    //----------------------------------------------------------
    // Status
    //----------------------------------------------------------

    stats() {

        return {

            running: this.running,

            printers: this.printers.size

        };

    }

}

module.exports = StaticProvider;