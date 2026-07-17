"use strict";

const { Op } = require("sequelize");

const SequelizeRepository = require("./SequelizeRepository");
const { Job } = require("../database");

class JobRepository extends SequelizeRepository {

    constructor(database) {

        super(database.model("Job"));

    }

    //----------------------------------------------------------
    // Drucker
    //----------------------------------------------------------

    async findByPrinter(printerId) {

        return this.find(

            {
                printerId
            },

            {
                order: [["submittedAt", "ASC"]]
            }

        );

    }

    //----------------------------------------------------------
    // Warteschlange
    //----------------------------------------------------------

    async findByQueue(queueId) {

        return this.find(

            {
                queueId
            },

            {
                order: [["priority", "DESC"]]

            }

        );

    }

    //----------------------------------------------------------
    // Besitzer
    //----------------------------------------------------------

    async findByOwner(owner) {

        return this.find(

            {
                owner
            },

            {
                order: [["submittedAt", "DESC"]]
            }

        );

    }

    //----------------------------------------------------------
    // Status
    //----------------------------------------------------------

    async findByStatus(status) {

        return this.find(

            {
                status
            },

            {
                order: [["submittedAt", "ASC"]]
            }

        );

    }

    //----------------------------------------------------------
    // Wartend
    //----------------------------------------------------------

    async findQueued() {

        return this.find(

            {

                status: "QUEUED"

            },

            {

                order: [

                    ["priority", "DESC"],
                    ["submittedAt", "ASC"]

                ]

            }

        );

    }

    //----------------------------------------------------------
    // Geplant
    //----------------------------------------------------------

    async findScheduled() {

        return this.find({

            status: "SCHEDULED"

        });

    }

    //----------------------------------------------------------
    // Druckt
    //----------------------------------------------------------

    async findPrinting() {

        return this.find({

            status: "PRINTING"

        });

    }

    //----------------------------------------------------------
    // Fehler
    //----------------------------------------------------------

    async findFailed() {

        return this.find({

            status: "ERROR"

        });

    }

    //----------------------------------------------------------
    // Abgeschlossen
    //----------------------------------------------------------

    async findCompleted(limit = 100) {

        return this.model.findAll({

            where: {

                status: "COMPLETED"

            },

            limit,

            order: [

                ["finishedAt", "DESC"]

            ]

        });

    }

    //----------------------------------------------------------
    // Abgebrochen
    //----------------------------------------------------------

    async findCancelled() {

        return this.find({

            status: "CANCELLED"

        });

    }

    //----------------------------------------------------------
    // Priorität
    //----------------------------------------------------------

    async findByPriority(minPriority = 0) {

        return this.model.findAll({

            where: {

                priority: {

                    [Op.gte]: minPriority

                }

            },

            order: [

                ["priority", "DESC"],

                ["submittedAt", "ASC"]

            ]

        });

    }

    //----------------------------------------------------------
    // Dokumentname
    //----------------------------------------------------------

    async findByName(name) {

        return this.model.findAll({

            where: {

                name: {

                    [Op.like]: `%${name}%`

                }

            },

            order: [

                ["submittedAt", "DESC"]

            ]

        });

    }

    //----------------------------------------------------------
    // Zeitraum
    //----------------------------------------------------------

    async findBetween(from, to) {

        return this.model.findAll({

            where: {

                submittedAt: {

                    [Op.between]: [

                        from,

                        to

                    ]

                }

            },

            order: [

                ["submittedAt", "DESC"]

            ]

        });

    }

    //----------------------------------------------------------
    // Nächster Job
    //----------------------------------------------------------

    async nextJob(queueId) {

        return this.model.findOne({

            where: {

                queueId,

                status: "QUEUED"

            },

            order: [

                ["priority", "DESC"],

                ["submittedAt", "ASC"]

            ]

        });

    }

    //----------------------------------------------------------
    // Statistik
    //----------------------------------------------------------

    async stats() {

        return {

            total: await this.count(),

            queued: await this.count({

                status: "QUEUED"

            }),

            scheduled: await this.count({

                status: "SCHEDULED"

            }),

            printing: await this.count({

                status: "PRINTING"

            }),

            completed: await this.count({

                status: "COMPLETED"

            }),

            cancelled: await this.count({

                status: "CANCELLED"

            }),

            errors: await this.count({

                status: "ERROR"

            })

        };

    }

}

module.exports = JobRepository;