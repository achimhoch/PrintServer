"use strict";

const { Op } = require("sequelize");

const SequelizeRepository = require("./SequelizeRepository");
const { Printer } = require("../database");

class PrinterRepository extends SequelizeRepository {

    constructor() {

        super(Printer);

    }

    //----------------------------------------------------------
    // Nach IP
    //----------------------------------------------------------

    async findByIp(ip) {

        return this.model.findOne({

            where: {
                ip
            }

        });

    }

    //----------------------------------------------------------
    // Nach Hostname
    //----------------------------------------------------------

    async findByHost(host) {

        return this.model.findOne({

            where: {
                host
            }

        });

    }

    //----------------------------------------------------------
    // Nach URI
    //----------------------------------------------------------

    async findByUri(uri) {

        return this.model.findOne({

            where: {
                uri
            }

        });

    }

    //----------------------------------------------------------
    // Nach Protokoll
    //----------------------------------------------------------

    async findByProtocol(protocol) {

        return this.model.findAll({

            where: {
                protocol
            },

            order: [["name", "ASC"]]

        });

    }

    //----------------------------------------------------------
    // Hersteller
    //----------------------------------------------------------

    async findByManufacturer(manufacturer) {

        return this.model.findAll({

            where: {

                manufacturer: {

                    [Op.like]: `%${manufacturer}%`

                }

            },

            order: [["manufacturer", "ASC"]]

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

            order: [["name", "ASC"]]

        });

    }

    //----------------------------------------------------------
    // Status
    //----------------------------------------------------------

    async findByStatus(status) {

        return this.model.findAll({

            where: {
                status
            }

        });

    }

    //----------------------------------------------------------
    // Online
    //----------------------------------------------------------

    async findOnline() {

        return this.model.findAll({

            where: {

                online: true

            },

            order: [["name", "ASC"]]

        });

    }

    //----------------------------------------------------------
    // Offline
    //----------------------------------------------------------

    async findOffline() {

        return this.model.findAll({

            where: {

                online: false

            },

            order: [["name", "ASC"]]

        });

    }

    //----------------------------------------------------------
    // Beschäftigt
    //----------------------------------------------------------

    async findBusy() {

        return this.model.findAll({

            where: {

                busy: true

            }

        });

    }

    //----------------------------------------------------------
    // Frei
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
    // Farbdruck
    //----------------------------------------------------------

    async findColorPrinters() {

        return this.model.findAll({

            where: {

                color: true

            }

        });

    }

    //----------------------------------------------------------
    // Duplex
    //----------------------------------------------------------

    async findDuplexPrinters() {

        return this.model.findAll({

            where: {

                duplex: true

            }

        });

    }

    //----------------------------------------------------------
    // Discovery Provider
    //----------------------------------------------------------

    async findByProvider(provider) {

        return this.model.findAll({

            where: {

                discovery: {

                    provider

                }

            }

        });

    }

    //----------------------------------------------------------
    // Statistik
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