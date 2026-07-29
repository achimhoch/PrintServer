"use strict";

const { Op } = require("sequelize");

const SequelizeRepository = require("./SequelizeRepository");
const { Printer } = require("../database");

class PrinterRepository extends SequelizeRepository {

    constructor(model) {

        super(model);

    }

    //---------------------------------------------------------- 

    async findByUuid(uuid) {

        if (!uuid)

            return null;

        return this.model.findOne({

            where: {

                uuid

            }

        });

    }

    //----------------------------------------------------------

    async findByIp(ip) {

        return this.model.findOne({

            where: {

                ip

            }

        });

    }

    //----------------------------------------------------------

    async findByUri(uri) {

        return this.model.findOne({

            where: {

                uri

            }

        });

    }

    //----------------------------------------------------------

    async create(values) {
        
        return this.model.create(values);

    }

    //----------------------------------------------------------

    async update(id, values) {

        const printer = await this.model.findByPk(id);

        if (!printer)

            return null;

        await printer.update(values);

        return printer;

    }

    //----------------------------------------------------------

    async findAll() {

        return this.model.findAll({

            order: [

                ["name", "ASC"]

            ]

        });

    }

    //----------------------------------------------------------

    async findOnline() {

        return this.model.findAll({

            where: {

                online: true

            },

            order: [

                ["name", "ASC"]

            ]

        });

    }

    //----------------------------------------------------------

    async stats() {

        return {

            total: await this.model.count(),

            online: await this.model.count({

                where: {

                    online: true

                }

            }),

            offline: await this.model.count({

                where: {

                    online: false

                }

            }),

            busy: await this.model.count({

                where: {

                    busy: true

                }

            }),

            color: await this.model.count({

                where: {

                    color: true

                }

            }),

            duplex: await this.model.count({

                where: {

                    duplex: true

                }

            })

        };

    }

}

module.exports = PrinterRepository;