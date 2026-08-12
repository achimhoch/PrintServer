"use strict";

const { Op } = require("sequelize");

const SequelizeRepository = require("./SequelizeRepository"); 
//const { Printer } = require("../database");

class PrinterRepository extends SequelizeRepository {

    constructor(model) {

        super(model);
         //console.log(model);
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

    async findById(id) {

        return this.model.findOne({
            where: {id}
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

        const printer = await this.model.create(values);

        return printer;



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

                ["name", "DESC"]

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

                ["name", "DESC"]

            ]

        });

    }

    //---------------------------------------------------------- 

    async statistics() {

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
        //console.log(printer);
        let entity = null;
       

        if (printer.uuid) {
            entity = await this.findByUuid(printer.uuid); 
            //console.log("uuid: ", entity?.id);
        }

       if (!entity && printer.ip) {
            entity = await this.findByIp(printer.ip);
            //console.log("ip: ", entity?.id);
        }

        if (!entity && printer.uri) {
            entity = await this.findByUri(printer.uri) 
            //console.log("Uri: ", entity?.id);
        }

        if (entity) {
            //console.log(entity);

            try {
                //await this.update(entity.id, {
                const result = await entity.update({
                    ...printer,
                    online: true,
                    lastSeen: new Date(),
                    lastUpdate: new Date()
        
                });
                //console.log(result);
                 console.log(`Printer ${entity.name} updated....`);
                //console.dir(entity).toJSON());

                return entity;
            }
            catch (err) {
                console.error(`${entity.name} update error:`);

                console.error(err);

                throw err; 
            }
            
        }
        
        try {
            const created = await this.create({
                ...printer,
                lastSeen: new Date(),
                online: true,
                discovered: true
            });

            console.log(`Printer ${printer.name} created.....`);

            return created;
        }
        catch (err) {
            console.log(`${printer.name} create error:`);
            console.error(err);
            throw err;
        }
    }

}

module.exports = PrinterRepository;