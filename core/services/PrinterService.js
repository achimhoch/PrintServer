"use strict";

class PrinterService {

    constructor(repository) {

        this.repository = repository;

    }

    //----------------------------------------------------------
    // Discovery
    //----------------------------------------------------------

    async upsertDiscovery(printer) {
        console.log("create printer");
        //console.log(printer);
        return this.repository.upsertDiscovery(printer);
        

    }

    //----------------------------------------------------------

    async update(id, values) {

        return this.repository.update(

            id,

            values

        );

    }

    //----------------------------------------------------------

    async findAll() {

        return this.repository.findAll();

    }

    //----------------------------------------------------------

    async findOnline() {

        return this.repository.findOnline();

    }

    //----------------------------------------------------------

    async statistics() {

        return this.repository.stats();

    }

}

module.exports = PrinterService;