"use strict";

const BaseManager=require("./BaseManager");

class JobManager extends BaseManager{

    constructor(service,eventBus){

        super(eventBus);

        this.service=service;

    }

    async create(job){

        return this.service.create(job);

    }

    async start(id){

        return this.service.start(id);

    }

    async finish(id){

        return this.service.finish(id);

    }

    async fail(id,error){

        return this.service.fail(id,error);

    }

}

module.exports=JobManager;