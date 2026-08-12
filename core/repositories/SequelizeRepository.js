"use strict";

const Repository = require("./Repository");

class SequelizeRepository extends Repository {

    constructor(model) {

        if (!model) {

            throw new Error("Sequelize model is required."); 

        }

        super(model.name);

        this.model = model;
        console.log(model);

    }

    //----------------------------------------------------------
    // Alle Datensätze
    //----------------------------------------------------------

    async findAll(options = {}) {

        return this.model.findAll(options);

    }

    //----------------------------------------------------------
    // Nach ID
    //----------------------------------------------------------

    async findById(id) {

        return this.model.findByPk(id);

    }

    //----------------------------------------------------------
    // Einen Datensatz
    //----------------------------------------------------------

    async findOne(where) {

        return this.model.findOne({

            where

        });

    }

    //----------------------------------------------------------
    // Suchen
    //----------------------------------------------------------

    async find(options = {}) {

        return this.model.findAll(options);

    }

    //----------------------------------------------------------
    // Existiert?
    //----------------------------------------------------------

    async exists(where) {

        const count = await this.model.count({

            where

        });

        return count > 0;

    }

    //----------------------------------------------------------
    // Anzahl
    //----------------------------------------------------------

    async count(where = {}) {

        return this.model.count({

            where

        });

    }

    //----------------------------------------------------------
    // Erstellen
    //----------------------------------------------------------

    async create(values, options = {}) {
       
        return this.model.create(

            values,

            options

        );

    }

    //----------------------------------------------------------
    // Bulk Create
    //----------------------------------------------------------

    async bulkCreate(values, options = {}) {

        return this.model.bulkCreate(

            values,

            options

        );

    }

    //---------------------------------------------------------- 
    // Aktualisieren über ID
    //----------------------------------------------------------

    async update(id, values, options = {}) {
        //console.log(values);
        const entity = await this.findById(id);

        if (!entity)

            return null;

        await entity.update(

            values,

            options

        );

        return entity;

    }

    //----------------------------------------------------------
    // Update WHERE
    //----------------------------------------------------------

    async updateWhere(where, values) {

        return this.model.update(

            values,

            {

                where

            }

        );

    }

    //----------------------------------------------------------
    // Upsert
    //----------------------------------------------------------

    async upsert(values) {

        const result = await this.model.upsert(values); 

        return result;

    }

    //----------------------------------------------------------
    // Löschen über ID
    //----------------------------------------------------------

    async delete(id) {

        const entity = await this.findById(id);

        if (!entity)

            return false;

        await entity.destroy();

        return true;

    }

    //----------------------------------------------------------
    // Löschen WHERE
    //----------------------------------------------------------

    async deleteWhere(where) {

        return this.model.destroy({

            where

        });

    }

    //----------------------------------------------------------
    // Truncate
    //----------------------------------------------------------

    async truncate() {

        return this.model.destroy({

            truncate: true,

            force: true

        });

    }

    //----------------------------------------------------------
    // Transaktion
    //----------------------------------------------------------

    async transaction(callback) {

        return this.model.sequelize.transaction(

            callback

        );

    }

}

module.exports = SequelizeRepository;