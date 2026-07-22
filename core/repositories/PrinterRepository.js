"use strict";

const { Op } = require("sequelize");

const SequelizeRepository = require("./SequelizeRepository"); 

class PrinterRepository extends SequelizeRepository {

    constructor(model) {

        super(model);

    }

    //----------------------------------------------------------
    // Eindeutige Merkmale
    //----------------------------------------------------------

    async findById(id) {

        return this.get(id);

    }

    async findByUuid(uuid) {

        return this.first({

            uuid

        });

    }

    async findByIp(ip) {

        return this.first({

            ip

        });

    }

    async findByHost(host) {

        return this.first({

            host

        });

    }

    async findByUri(uri) {

        return this.first({

            uri

        });

    }

    //----------------------------------------------------------
    // Discovery
    //----------------------------------------------------------

    async findByDiscoveryProvider(provider) {

        return this.find({

            discoveryProvider: provider

        });

    }

    async findDiscovered() {

        return this.find({

            discovered: true

        });

    }

    //----------------------------------------------------------
    // Status
    //----------------------------------------------------------

    async findOnline() {

        return this.find({

            online: true

        });

    }

    async findOffline() {

        return this.find({

            online: false

        });

    }

    async findBusy() {

        return this.find({

            busy: true

        });

    }

    async findIdle() {

        return this.find({

            online: true,

            busy: false

        });

    }

    async findByState(state) {

        return this.find({

            state

        });

    }

    //----------------------------------------------------------
    // Eigenschaften
    //----------------------------------------------------------

    async findColorPrinters() {

        return this.find({

            color: true

        });

    }

    async findDuplexPrinters() {

        return this.find({

            duplex: true

        });

    }

    async findByProtocol(protocol) {

        return this.find({

            protocol

        });

    }

    async findByDriver(driver) {

        return this.find({

            driver

        });

    }

    //----------------------------------------------------------
    // Hersteller
    //----------------------------------------------------------

    async findByManufacturer(name) {

        return this.model.findAll({

            where: {

                manufacturer: {

                    [Op.like]: `%${name}%`

                }

            },

            order: [

                ["manufacturer", "ASC"],

                ["model", "ASC"]

            ]

        });

    }

    //----------------------------------------------------------
    // Modell
    //----------------------------------------------------------

    async findByModel(model) {

        return this.model.findAll({

            where: {

                model: {

                    [Op.like]: `%${model}%`

                }

            }

        });

    }

    //----------------------------------------------------------
    // Standort
    //----------------------------------------------------------

    async findByLocation(location) {

        return this.model.findAll({

            where: {

                location: {

                    [Op.like]: `%${location}%`

                }

            },

            order: [

                ["location", "ASC"],

                ["name", "ASC"]

            ]

        });

    }

    //----------------------------------------------------------
    // Aktualisierung
    //----------------------------------------------------------

    async touch(id) {

        return this.update(

            id,

            {

                lastSeen: new Date(),

                online: true

            }

        );

    }

    async setOffline(id) {

        return this.update(

            id,

            {

                online: false,

                busy: false

            }

        );

    }

    //----------------------------------------------------------
    // Discovery Upsert
    //----------------------------------------------------------

    async upsertDiscovery(printer) {

        let entity = null;

        if (printer.uuid)

            entity = await this.findByUuid(

                printer.uuid

            );

        if (!entity && printer.ip)

            entity = await this.findByIp(

                printer.ip

            );

        if (!entity && printer.uri)

            entity = await this.findByUri(

                printer.uri

            );

        if (!entity)

            return this.add(printer);

        return this.update(

            entity.id,

            {

                ...printer,

                lastSeen: new Date(),

                online: true

            }

        );

    }

    //----------------------------------------------------------
    // Statistik
    //----------------------------------------------------------

    async stats() {

        return {

            total: await this.count(),

            online: await this.count({

                online: true

            }),

            offline: await this.count({

                online: false

            }),

            busy: await this.count({

                busy: true

            }),

            idle: await this.count({

                online: true,

                busy: false

            }),

            color: await this.count({

                color: true

            }),

            duplex: await this.count({

                duplex: true

            })

        };

    }

}

module.exports = PrinterRepository;