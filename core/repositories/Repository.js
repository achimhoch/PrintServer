"use strict";

class Repository {

    constructor(name = "Repository") {

        this.name = name;

    }

    //----------------------------------------------------------
    // Allgemein
    //----------------------------------------------------------

    async findAll() {

        throw new Error(

            `${this.name}.findAll() not implemented.`

        );

    }

    //----------------------------------------------------------

    async findById(id) {

        throw new Error(

            `${this.name}.findById() not implemented.`

        );

    }

    //----------------------------------------------------------

    async findOne(where) {

        throw new Error(

            `${this.name}.findOne() not implemented.`

        );

    }

    //----------------------------------------------------------

    async exists(where) {

        throw new Error(

            `${this.name}.exists() not implemented.`

        );

    }

    //----------------------------------------------------------

    async count(where = {}) {

        throw new Error(

            `${this.name}.count() not implemented.`

        );

    }

    //----------------------------------------------------------
    // Schreiben
    //----------------------------------------------------------

    async create(values) {

        throw new Error(

            `${this.name}.create() not implemented.`

        );

    }

    //----------------------------------------------------------

    async update(id, values) {

        throw new Error(

            `${this.name}.update() not implemented.`

        );

    }

    //----------------------------------------------------------

    async upsert(values) {

        throw new Error(

            `${this.name}.upsert() not implemented.`

        );

    }

    //----------------------------------------------------------

    async delete(id) {

        throw new Error(

            `${this.name}.delete() not implemented.`

        );

    }

    //----------------------------------------------------------

    async deleteWhere(where) {

        throw new Error(

            `${this.name}.deleteWhere() not implemented.`

        );

    }

    //----------------------------------------------------------

    async truncate() {

        throw new Error(

            `${this.name}.truncate() not implemented.`

        );

    }

    //----------------------------------------------------------
    // Transaktionen
    //----------------------------------------------------------

    async transaction(callback) {

        throw new Error(

            `${this.name}.transaction() not implemented.`

        );

    }

}

module.exports = Repository;