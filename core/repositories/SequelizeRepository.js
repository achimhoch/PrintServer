"use strict";

const { Op } = require("sequelize");
const Repository = require("./Repository");

class SequelizeRepository extends Repository {

    constructor(model) {

        super(model.name);

        this.model = model;

    }

    //----------------------------------------------------------
    // CRUD
    //----------------------------------------------------------

    async add(entity, options = {}) {

        return this.model.create(entity, options);

    }

    async update(id, values, options = {}) {

        await this.model.update(
            values,
            {
                where: { id },
                ...options
            }
        );

        return this.get(id, options);

    }

    async replace(id, entity, options = {}) {

        entity.id = id;

        await this.model.upsert(
            entity,
            options
        );

        return this.get(id, options);

    }

    async remove(id, options = {}) {

        return this.model.destroy({

            where: { id },

            ...options

        });

    }

    async clear(options = {}) {

        return this.model.destroy({

            where: {},

            truncate: true,

            ...options

        });

    }

    //----------------------------------------------------------
    // Lesen
    //----------------------------------------------------------

    async get(id, options = {}) {

        return this.model.findByPk(
            id,
            options
        );

    }

    async has(id) {

        return (await this.count({

            id

        })) > 0;

    }

    async all(options = {}) {

        return this.model.findAll(options);

    }

    async first(where = {}, options = {}) {

        return this.model.findOne({

            where,

            ...options

        });

    }

    async find(where = {}, options = {}) {

        return this.model.findAll({

            where,

            ...options

        });

    }

    async count(where = {}) {

        return this.model.count({

            where

        });

    }

    //----------------------------------------------------------
    // Upsert
    //----------------------------------------------------------

    async upsert(entity, options = {}) {

        await this.model.upsert(
            entity,
            options
        );

        return this.get(entity.id);

    }

    //----------------------------------------------------------
    // Bulk
    //----------------------------------------------------------

    async bulkCreate(entities, options = {}) {

        return this.model.bulkCreate(

            entities,

            {

                validate: true,

                ...options

            }

        );

    }

    async bulkUpdate(where, values) {

        return this.model.update(

            values,

            {

                where

            }

        );

    }

    async bulkDelete(where) {

        return this.model.destroy({

            where

        });

    }

    //----------------------------------------------------------
    // Pagination
    //----------------------------------------------------------

    async paginate({

        page = 1,

        pageSize = 25,

        where = {},

        order = [["id", "ASC"]],

        include = []

    } = {}) {

        const offset = (page - 1) * pageSize;

        const result = await this.model.findAndCountAll({

            where,

            order,

            include,

            limit: pageSize,

            offset

        });

        return {

            page,

            pageSize,

            total: result.count,

            pages: Math.ceil(

                result.count / pageSize

            ),

            rows: result.rows

        };

    }

    //----------------------------------------------------------
    // Suche
    //----------------------------------------------------------

    async search(fields, text) {

        const where = {

            [Op.or]: fields.map(field => ({

                [field]: {

                    [Op.like]: `%${text}%`

                }

            }))

        };

        return this.find(where);

    }

    //----------------------------------------------------------
    // Transaktionen
    //----------------------------------------------------------

    async transaction(callback) {

        return this.model.sequelize.transaction(

            callback

        );

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

module.exports = SequelizeRepository;