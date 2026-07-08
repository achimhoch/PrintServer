"use strict";

const { EventEmitter } = require("events");
const bonjour = require("bonjour")();

class MdnsProvider extends EventEmitter {

    constructor(options = {}) {

        super();

        this.options = options;

        this.browser = null;

        this.running = false;

        this.printers = new Map();

    }

    //----------------------------------------------------------
    // Start
    //----------------------------------------------------------

    async start() {

        if (this.running)
            return;

        this.running = true;

        this.browser = bonjour.find({

            type: "ipp"

        });

        this.browser.on(

            "up",

            service => this.serviceUp(service)

        );

        this.browser.on(

            "down",

            service => this.serviceDown(service)

        );

    }

    //----------------------------------------------------------
    // Stop
    //----------------------------------------------------------

    async stop() {

        if (!this.running)
            return;

        this.running = false;

        if (this.browser) {

            this.browser.stop();

            this.browser = null;

        }

    }

    //----------------------------------------------------------
    // Drucker gefunden
    //----------------------------------------------------------

    serviceUp(service) {

        const id =
            service.fqdn ||
            service.host ||
            service.name;

        const printer = {

            id,

            protocol: "ipp",

            name: service.name,

            host: service.host,

            ip: service.referer?.address ||

                (service.addresses
                    ? service.addresses[0]
                    : null),

            port: service.port,

            uri: `ipp://${service.host}:${service.port}/ipp/print`,

            manufacturer:
                service.txt?.ty || "",

            model:
                service.txt?.product || "",

            location:
                service.txt?.note || "",

            txt: service.txt || {}

        };

        if (!this.printers.has(id)) {

            this.printers.set(id, printer);

            this.emit(

                "printerFound",

                printer

            );

        }
        else {

            this.printers.set(id, printer);

            this.emit(

                "printerUpdated",

                printer

            );

        }

    }

    //----------------------------------------------------------
    // Drucker verschwunden
    //----------------------------------------------------------

    serviceDown(service) {

        const id =
            service.fqdn ||
            service.host ||
            service.name;

        const printer = this.printers.get(id);

        if (!printer)
            return;

        this.printers.delete(id);

        this.emit(

            "printerLost",

            printer

        );

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

module.exports = MdnsProvider;