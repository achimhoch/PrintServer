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

    //----------------------------------------------------------
    // Aktiviert
    //----------------------------------------------------------

    async findEnabled() {

        return this.find({

            enabled: true

        });

    }

    //----------------------------------------------------------
    // Deaktiviert
    //----------------------------------------------------------

    async findDisabled() {

        return this.find({

            enabled: false

        });

    }

    //----------------------------------------------------------
    // Pausiert
    //----------------------------------------------------------

    async findPaused() {

        return this.find({

            paused: true

        });

    }

    //----------------------------------------------------------
    //Alle Queues
    //----------------------------------------------------------
     async findAll() {

        return this.model.findAll({

            order: [

                ["name", "DESC"]

            ]

        });

    }

    //----------------------------------------------------------
    // Verarbeitung
    //----------------------------------------------------------

    async findProcessing() {

        return this.find({

            processing: true

        });

    }

    //----------------------------------------------------------
    // Idle Queues
    //----------------------------------------------------------

    async findIdle() {

        return this.model.findAll({

            where: {

                enabled: true,

                paused: false,

                processing: false

            },

            order: [

                ["priority", "DESC"],

                ["name", "ASC"]

            ]

        });

    }

    //----------------------------------------------------------
    // Queues mit Jobs
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
    // Jobzähler erhöhen
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

    //----------------------------------------------------------
    // Jobzähler reduzieren
    //----------------------------------------------------------

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
    //add
    //----------------------------------------------------------

    async add(values) {

        return this.model.create(values);
    }

    //---------------------------------------------------------- 
    // Statistik
    //----------------------------------------------------------

    async stats() {

        return {

            total:
                await this.count(),

            enabled:
                await this.count({

                    enabled: true

                }),

            disabled:
                await this.count({

                    enabled: false

                }),

            active:
                await this.model.count({

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