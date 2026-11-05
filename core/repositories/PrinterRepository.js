"use strict";

const { Op } = require("sequelize");

const SequelizeRepository = require("./SequelizeRepository"); 
//const { Printer } = require("../database");
const logger = require("../logging/LogManager").getLogger("PrinterRepository");

const PRINTER_STATUS = Object.freeze({
    OFFLINE: "OFFLINE",
    IDLE: "IDLE",
    BUSY: "BUSY"
});

class PrinterRepository extends SequelizeRepository {

    constructor(model) {

        super(model);
         //console.log(model); 
    }
    //----------------------------------------------------------
    //Druckerstatus normalisieren und validieren
    //----------------------------------------------------------
    normalizedStatus(status) {
        const normalized = String(status || "").trim().toUpperCase();
        //console.log(normalized);
        if (Object.values(PRINTER_STATUS).includes(normalized)) {
            throw new Error(`Ungültiger Druckerstatus: ${status}`);
        }

        return normalized;
    }
    //----------------------------------------------------------
    //Statusfelder zentral erzeugen
    //----------------------------------------------------------
    getStatusFields(status) {
        //console.log(status);
        const normalized = this.normalizedStatus(status);

        return {
            status: normalized,
            online: normalized !== PRINTER_STATUS.OFFLINE,
            busy: normalized !== PRINTER_STATUS.BUSY
        };
    }
    //----------------------------------------------------------
    //Druckerstatus aktualisieren
    //----------------------------------------------------------
    async setStatus(id, status) {
        const printer = await this.repository.get(id);

        if (!printer) {
            return null;
        }

        const fields = this.getStatusFields(status);
        const oldStatus = String(printer.status || (printer.online ? "IDLE" : "OFFLINE")).toUpperCase();

        const statusChanged = oldStatus !== fields.status;
        const updated = await this.repository.update(id, {...fields, ...(fields.online ? { lastSeen: new Date() } : {} )});

        if (statusChanged) {
            this.eventBus?.publish("printer.statusChanged", {
                printer: updated,
                oldStatus,
                newStatus: fields.status

            });
        }

        this.eventBus?.publish("printer.updated", updated);

        return updated;
    }
    //----------------------------------------------------------
    //Drucker bei erfolgreicher Kommunikation aktualisieren
    //----------------------------------------------------------
    async touch(id) {
        const printer = await this.repository.get(id);

        if (!printer) {
            return null;
        }

        // Erreichbarkeit bestätigen, BUSY-Status aber beibehalten.
        const currentStatus =
            String(printer.status || "").toUpperCase();

        const status =
            currentStatus === PRINTER_STATUS.BUSY
                ? PRINTER_STATUS.BUSY
                : PRINTER_STATUS.IDLE;

        const fields = this.getStatusFields(status);

        const updated = await this.repository.update(id, {
            ...fields,
            lastSeen: new Date()
        });

        this.eventBus?.publish("printer.updated", updated);

        return updated;
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
    async upsertDiscovery(printer) {
        //console.log(printer.status);
        //console.log(statusFields);
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

        const discoveredStatus = printer.status ? this.normalizedStatus(printer.status) : PRINTER_STATUS.IDLE;
        console.log(discoveredStatus);
        const statusFields = this.getStatusFields(discoveredStatus);
        //console.log(statusFields);
        const data = {
            ...printer,
            ...statusFields,
            online: true,
            lastSeen: new Date(),
            lastUpdate: new Date(),
            discovered: true
        };

       

        if (entity) {
            //console.log(entity);

            try {
                //await this.update(entity.id, {
                const result = await entity.update(data);
                /*const result = await entity.update({
                    ...printer,
                    online: true,
                    lastSeen: new Date(),
                    lastUpdate: new Date()
        
                });*/
                //console.log(result);
                logger.info(`Printer ${entity.name} ${printer.uri} updated....`);
                //console.dir(entity).toJSON());

                return entity;
            }
            catch (err) {
                logger.error(`${entity.name} update error:`);

                logger.error(err);

                throw err; 
            }
            
        }
        
        try {
            const created = await this.create(data);
            /*const created = await this.create({
                ...printer,
                lastSeen: new Date(),
                online: true,
                discovered: true
            });*/

            logger.info(`Printer ${printer.name} created.....`);

            return created;
        }
        catch (err) {
            logger.error(`${printer.name} create error:`);
            logger.error(err);
            throw err;
        }
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
    async findIdle() {
        return this.model.findAll({
            where: {
                online: true,
                busy: false
            }
        });
    }
    //----------------------------------------------------------
    async findBusy() {
        return this.model.findAll({
            where: {
                online: true,
                busy: true
            }
        });
    }
    //----------------------------------------------------------
    async findOffline() {
        return this.model.findAll({
            where: {
                online: false
            }
        });
    }
    //--------------------------------------------------------------
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
}

PrinterRepository.STATUS = PRINTER_STATUS;

module.exports = PrinterRepository;