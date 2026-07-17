"use strict";

const BaseService = require("./BaseService");

class QueueService extends BaseService {

    constructor(repository,eventBus){

        super(repository,eventBus);

    }

    async enqueue(job){

        return this.repository.enqueue(job);

    }

    async dequeue(){

        return this.repository.dequeue();

    }

}

module.exports = QueueService;