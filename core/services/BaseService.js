"use strict";

class BaseService {

    constructor(repository, eventBus) {

        this.repository = repository;

        this.eventBus = eventBus;

    }

    //----------------------------------------------------------

    async create(data) {

        return this.repository.add(data);

    }

    //----------------------------------------------------------

    async update(id, data) {

        return this.repository.update(id, data);

    }

    //----------------------------------------------------------

    async remove(id) {

        return this.repository.remove(id);

    }

    //----------------------------------------------------------

    async get(id) {

        return this.repository.get(id);

    }

    //----------------------------------------------------------

    async getAll() {

        return this.repository.all();

    }

}

module.exports = BaseService;