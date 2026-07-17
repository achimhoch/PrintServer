"use strict";

const { Op } = require("sequelize");

const SequelizeRepository = require("./SequelizeRepository");

class QueueRepository extends SequelizeRepository {

    constructor(model) {

        super(model);

    }

    //----------------------------------------------------------
    // Drucker
    //----------------------------------------------------------

    async findByPrinter(printerId) {

        return this.first({

            printerId

        });

    }

    //----------------------------------------------------------
    // Name
    //----------------------------------------------------------

    async findByName(name) {

        return this.first({

            name

        });

    }

    //----------------------------------------------------------
    // Status
    //----------------------------------------------------------

    async findByStatus(status) {

        return this.find({

            status

        });

    }

    async findEnabled() {

        return this.find({

            enabled: true

        });

    }

    async findDisabled() {

        return this.find({

            enabled: false

        });

    }

    //----------------------------------------------------------
    // Warteschlangen mit Jobs
    //----------------------------------------------------------

    async findActive() {

        return this.model.findAll({

            where: {

                jobCount: {

                    [Op.gt]: 0

                }

            },

            order: [

                ["jobCount", "DESC"]

            ]

        });

    }

    //----------------------------------------------------------
    // Leere Queues
    //----------------------------------------------------------

    async findEmpty() {

        return this.find({

            jobCount: 0

        });

    }

    //----------------------------------------------------------
    // Jobzähler
    //----------------------------------------------------------

    async incrementJobs(id) {

        return this.model.increment(

            "jobCount",

            {

                by: 1,

                where: {

                    id

                }

            }

        );

    }

    async decrementJobs(id) {

        return this.model.increment(

            "jobCount",

            {

                by: -1,

                where: {

                    id

                }

            }

        );

    }

    //----------------------------------------------------------
    // Statistik
    //----------------------------------------------------------

    async stats() {

        return {

            total: await this.count(),

            enabled: await this.count({

                enabled: true

            }),

            disabled: await this.count({

                enabled: false

            }),

            active: await this.model.count({

                where: {

                    jobCount: {

                        [Op.gt]: 0

                    }

                }

            })

        };

    }

}

module.exports = QueueRepository;