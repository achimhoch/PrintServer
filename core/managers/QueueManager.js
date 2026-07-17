"use strict";

const BaseManager=require("./BaseManager");

class QueueManager extends BaseManager{

    constructor(service,eventBus){

        super(eventBus);

        this.service=service;

    }

    async enqueue(job){

        return this.service.enqueue(job);

    }

    async dequeue(){

        return this.service.dequeue();

    }

}

module.exports=QueueManager;