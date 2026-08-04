"use strict";

class PrinterService {

    constructor(repository) {

        this.repository = repository;

    }

    //----------------------------------------------------------
    // Discovery
    //----------------------------------------------------------

    async upsertDiscovery(printer) {
       
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
    async findById(id) {
        return this.repository.findById(id);
    }

    //----------------------------------------------------------

    async findOnline() {

        return this.repository.findOnline();

    }

    //----------------------------------------------------------

    async statistics() {

        return this.repository.statistics();

    }

}

module.exports = PrinterService;