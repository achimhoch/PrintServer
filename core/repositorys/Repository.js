"use strict";

/**
 * Abstrakte Basisklasse für alle Repositorys.
 *
 * Implementierungen:
 *   - MemoryRepository
 *   - SqliteRepository
 *   - PostgreSqlRepository
 *   - RedisRepository
 */
class Repository {

    constructor(entityName = "Entity") {

        this.entityName = entityName;

    }

    //----------------------------------------------------------
    // CRUD
    //----------------------------------------------------------

    async add(entity) {

        throw new Error(`${this.entityName}: add() not implemented.`);

    }

    async update(id, values = {}) {

        throw new Error(`${this.entityName}: update() not implemented.`);

    }

    async remove(id) {

        throw new Error(`${this.entityName}: remove() not implemented.`);

    }

    async clear() {

        throw new Error(`${this.entityName}: clear() not implemented.`);

    }

    //----------------------------------------------------------
    // Lesen
    //----------------------------------------------------------

    async get(id) {

        throw new Error(`${this.entityName}: get() not implemented.`);

    }

    async has(id) {

        throw new Error(`${this.entityName}: has() not implemented.`);

    }

    async all() {

        throw new Error(`${this.entityName}: all() not implemented.`);

    }

    async count() {

        throw new Error(`${this.entityName}: count() not implemented.`);

    }

    //----------------------------------------------------------
    // Suche
    //----------------------------------------------------------

    async find(predicate) {

        const items = await this.all();

        return items.filter(predicate);

    }

    async first(predicate) {

        const items = await this.all();

        return items.find(predicate) || null;

    }

    //----------------------------------------------------------
    // Statistik
    //----------------------------------------------------------

    async stats() {

        return {

            entity: this.entityName,

            count: await this.count()

        };

    }

}

module.exports = Repository;