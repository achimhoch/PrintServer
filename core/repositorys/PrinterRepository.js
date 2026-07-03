"use strict";

const MemoryRepository = require("../repositorys/MermoryRepository");

class PrinterRepository extends MemoryRepository {

    constructor() {

        super("Printer");

    }

    //----------------------------------------------------------
    // Suche nach ID
    //----------------------------------------------------------

    async findById(id) {

        return this.get(id); 

    }

    //----------------------------------------------------------
    // Suche nach IP
    //----------------------------------------------------------

    async findByIp(ip) {

        return this.first(

            printer => printer.ip === ip

        );

    }

    //----------------------------------------------------------
    // Suche nach Hostname
    //----------------------------------------------------------

    async findByHost(host) {

        return this.first(

            printer => printer.host === host

        );

    }

    //----------------------------------------------------------
    // Suche nach URI
    //----------------------------------------------------------

    async findByUri(uri) {

        return this.first(

            printer => printer.uri === uri

        );

    }

    //----------------------------------------------------------
    // Nach Protokoll
    //----------------------------------------------------------

    async findByProtocol(protocol) {

        return this.find(

            printer =>

                printer.protocol === protocol

        );

    }

    //----------------------------------------------------------
    // Nach Hersteller
    //----------------------------------------------------------

    async findByManufacturer(manufacturer) {

        manufacturer = manufacturer.toLowerCase();

        return this.find(

            printer =>

                (printer.manufacturer || "")
                    .toLowerCase()
                    .includes(manufacturer)

        );

    }

    //----------------------------------------------------------
    // Nach Modell
    //----------------------------------------------------------

    async findByModel(model) {

        model = model.toLowerCase();

        return this.find(

            printer =>

                (printer.model || "")
                    .toLowerCase()
                    .includes(model)

        );

    }

    //----------------------------------------------------------
    // Nach Standort
    //----------------------------------------------------------

    async findByLocation(location) {

        location = location.toLowerCase();

        return this.find(

            printer =>

                (printer.location || "")
                    .toLowerCase()
                    .includes(location)

        );

    }

    //----------------------------------------------------------
    // Status
    //----------------------------------------------------------

    async findOnline() {

        return this.find(

            printer => printer.online === true

        );

    }

    async findOffline() {

        return this.find(

            printer => printer.online === false

        );

    }

    async findBusy() {

        return this.find(

            printer => printer.busy === true

        );

    }

    async findIdle() {

        return this.find(

            printer =>

                printer.online === true &&
                printer.busy === false

        );

    }

    //----------------------------------------------------------
    // Nach Status
    //----------------------------------------------------------

    async findByStatus(status) {

        return this.find(

            printer => printer.status === status

        );

    }

    //----------------------------------------------------------
    // Fähigkeiten
    //----------------------------------------------------------

    async findColorPrinters() {

        return this.find(

            printer => printer.color === true

        );

    }

    async findDuplexPrinters() {

        return this.find(

            printer => printer.duplex === true

        );

    }

    //----------------------------------------------------------
    // Discovery Provider
    //----------------------------------------------------------

    async findByProvider(provider) {

        return this.find(

            printer =>

                printer.discovery?.provider === provider

        );

    }

    //----------------------------------------------------------
    // Statistik
    //----------------------------------------------------------

    async stats() {

        const printers = await this.all();

        return {

            total: printers.length,

            online: printers.filter(p => p.online).length,

            offline: printers.filter(p => !p.online).length,

            busy: printers.filter(p => p.busy).length,

            color: printers.filter(p => p.color).length,

            duplex: printers.filter(p => p.duplex).length

        };

    }

}

module.exports = PrinterRepository;