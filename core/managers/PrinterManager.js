"use strict";

const BaseManager=require("./BaseManager"); 

class PrinterManager extends BaseManager{

    constructor(printerService, driverRegistry, eventBus ){

        super();

        this.service = printerService; 
        this.drivers = driverRegistry;
        this.eventBus = eventBus;

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

    async upsertDiscovery(printer){
        //console.log("Printermanager", printer);

        const saved = await this.service.upsertDiscovery(printer);

        this.eventBus.publish("printer.updated", saved)
        return saved;

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