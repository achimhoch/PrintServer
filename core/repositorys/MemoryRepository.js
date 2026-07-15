"use strict";

const Repository = require("./Repository");

class MemoryRepository extends Repository {

    constructor(entityName = "Entity") {

        super(entityName);

        this.items = new Map();

    }

    //----------------------------------------------------------
    // CRUD
    //----------------------------------------------------------

    async add(entity) {

        if (!entity)
            throw new Error(`${this.entityName}: entity is required.`);

        if (!entity.id)
            throw new Error(`${this.entityName}: entity.id is required.`);

        this.items.set(
            entity.id,
            entity
        );

        return entity;

    }

    async update(id, values = {}) {

        const entity = this.items.get(id);

        if (!entity)
            return null;

        Object.assign(
            entity,
            values
        );

        return entity;

    }

    async remove(id) {

        const entity = this.items.get(id);

        if (!entity)
            return null;

        this.items.delete(id);

        return entity;

    }

    async clear() {

        this.items.clear();

    }

    //----------------------------------------------------------
    // Lesen
    //----------------------------------------------------------

    async get(id) {

        return this.items.get(id) || null;

    }

    async has(id) {

        return this.items.has(id);

    }

    async all() {

        return [...this.items.values()];

    }

    async count() {

        return this.items.size;

    }

    //----------------------------------------------------------
    // Suche
    //----------------------------------------------------------

    async find(predicate) {

        const result = [];

        for (const entity of this.items.values()) {

            if (predicate(entity)) {

                result.push(entity);

            }

        }

        return result;

    }

    async first(predicate) {

        for (const entity of this.items.values()) {

            if (predicate(entity))
                return entity;

        }

        return null;

    }

    //----------------------------------------------------------
    // Iteration
    //----------------------------------------------------------

    values() {

        return this.items.values();

    }

    keys() {

        return this.items.keys();

    }

    entries() {

        return this.items.entries();

    }

    [Symbol.iterator]() {

        return this.items.values();

    }

    //----------------------------------------------------------
    // Statistik
    //----------------------------------------------------------

    async stats() {

        return {

            type: "memory",

            entity: this.entityName,

            count: this.items.size

        };

    }

}

module.exports = MemoryRepository;