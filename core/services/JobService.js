"use strict";

const BaseService = require("./BaseService");

class JobService extends BaseService {

    constructor(repository,eventBus){

        super(repository,eventBus);

    }

    async start(id){

        return this.update(id,{

            status:"processing",

            startedAt:new Date()

        });

    }

    async finish(id){

        return this.update(id,{

            status:"completed",

            finishedAt:new Date()

        });

    }

    async fail(id,error){

        return this.update(id,{

            status:"failed",

            error

        });

    }

}

module.exports = JobService;