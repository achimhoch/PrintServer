"use strict";

const BaseManager=require("./BaseManager"); 

class PrinterManager extends BaseManager{

    constructor(

        printerService,

        driverRegistry,

        eventBus

    ){

        super(eventBus);

        this.service = printerService;

        this.drivers = driverRegistry;

    }

    //---------------------------------------------------------- 
    

    async get(id){

        return this.service.get(id);

    }

    //----------------------------------------------------------

    async getAll(){

        return this.service.getAll();

    }

    //----------------------------------------------------------

    async upsertDiscoveredPrinter(printer){

        return this.service.upsertDiscoveredPrinter(

            printer

        );

    }

    //----------------------------------------------------------

    async setOffline(ip){

        return this.service.setOffline(ip);

    }

    //----------------------------------------------------------

    async print(printerId,job){

        const printer=

            await this.service.get(printerId);

        const driver=

            this.drivers.get(

                printer.driver

            );

        return driver.print(

            printer,

            job

        );

    }

}

module.exports=PrinterManager;