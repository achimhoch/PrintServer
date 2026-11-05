"use strict";
const BaseService = require("./BaseService");


class PrinterService extends BaseService {

    constructor(repository, eventBus) {

        //this.repository = repository;
        //this.eventBus = eventBus;
        super(repository, eventBus);
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
    async setOffline(ip) {
        const printer = await this.repository.findById(ip);

        if (!printer) {
            return null;
        }

        return this.repository.setStatus(printer.id, PRINTER_STATUS.OFFLINE);
    }
    //----------------------------------------------------------
    async getOnline() {
        return this.repository.findOnline();
    }
    //----------------------------------------------------------
    async getIdle() {
        return this.repository.findIdle();
    }
    //----------------------------------------------------------
    async getBusy() {
        return this.repository.findBusy();
    }
    //----------------------------------------------------------
    async getOffline() {
        return this.repository.findOffline();
    }
    //----------------------------------------------------------
    async statistics() {

        return this.repository.statistics();

    }

}

module.exports = PrinterService;