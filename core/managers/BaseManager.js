"use strict";

class BaseManager {

    constructor(eventBus){

        this.eventBus=eventBus;

    }

    async initialize(){}

    async start(){}

    async stop(){}

}

module.exports=BaseManager;