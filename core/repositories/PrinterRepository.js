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
        //console.log(uuid);
        if (!uuid)

            return null;

        const entity = await this.model.findOne({

            where: {

                uuid

            }

        });
        //console.log(entity);
        return entity;
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

    /*async create(values) {
        console.log(values);
        return this.model.create(values);

    }*/

    async create(values) {

    console.log("CREATE VALUES:");
    console.dir(values, { depth: null });

    try {

        const printer = await this.model.create(values);

        console.log("CREATED:");
        console.dir(printer.toJSON());

        return printer;

    }
    catch (err) {

        console.error("CREATE ERROR:");

        console.error(err);

        throw err;

    }

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

    async upsertDiscovery(printer) {
        console.log(printer);

       

        if (printer.uuid) {
            const entity = await this.findByUuid(printer.uuid);
            console.log(entity);
           if (!entity) {
                const insert = await this.model.create({
                    ...printer,
                    lastSeen: new Date(),
                    online: true,
                    discovered: true
                });
                console.log(insert);
                return insert;
           }
        }

       /*if (!entity && printer.ip) {
            entity = await this.findByIp(printer.ip);
        }

        if (!entity && printer.uri) {
            entity = await this.findByUri(printer.uri);
        }

        if (entity) {
            await entity.update({
                ...printer,
                lastSeen: new Date(),
                online: true
    
            });
            console.log(entity);
            return entity;
        }

        return this.model.create({
            ...printer,
            lastSeen: new Date(),
            online: true,
            discovered: true
        });*/
    }

}

module.exports = PrinterRepository;