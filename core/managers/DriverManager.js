"use strict";

const BaseManager=require("./BaseManager");

class DriverManager extends BaseManager{

    constructor(registry,eventBus){

        super(eventBus);

        this.registry=registry;

    }

    async initialize(){

        await this.registry.load();

    }

    get(name){

        return this.registry.get(name);

    }

    getAll(){

        return this.registry.all();

    }

}

module.exports=DriverManager;