"use strict";

const { op } = require("sequelize");

const SequelizeRepository = require("./SequelizeRepository");

class JobRepository extends SequelizeRepository {

    constructor(model) {

        super(model);

    }

    //----------------------------------------------------------
    // Drucker
    //----------------------------------------------------------

    async findByPrinter(printerId) {

        return this.find({

            printerId

        });

    }

    //----------------------------------------------------------
    // Queue
    //----------------------------------------------------------

    async findByQueue(queueId) {

        return this.find({

            queueId

        });

    }

    //----------------------------------------------------------
    // Benutzer
    //----------------------------------------------------------

    async findByOwner(owner) {

        return this.find({

            owner

        });

    }

    //----------------------------------------------------------
    // Einzelner Status
    //----------------------------------------------------------

    async findByStatus(status) {

        return this.find({

            status

        });

    }

    //----------------------------------------------------------
    // Wartende Jobs
    //----------------------------------------------------------

    async findQueued() {

        return this.model.findAll({

            where: {

                status: "QUEUED"

            },

            order: [

                ["priority", "DESC"],

                ["submittedAt", "ASC"]

            ]

        });

    }

    //----------------------------------------------------------
    // Druckende Jobs
    //----------------------------------------------------------

    async findPrinting() {

        return this.find({

            status: "PRINTING"

        });

    }

    //----------------------------------------------------------
    // Abgeschlossene Jobs
    //----------------------------------------------------------

    async findCompleted(limit = null) {

        const options = {

            where: {

                status: "COMPLETED"

            },

            order: [

                ["finishedAt", "DESC"]

            ]

        };

        if (limit) {

            options.limit = limit;

        }

        return this.model.findAll(
            options
        );

    }

    //----------------------------------------------------------
    // Fehlerhafte Jobs
    //----------------------------------------------------------

    async findFailed() {

        return this.find({

            status: "ERROR"

        });

    }

    //----------------------------------------------------------
    // Abgebrochene Jobs
    //----------------------------------------------------------

    async findCancelled() {

        return this.find({

            status: "CANCELLED"

        });

    }

    //----------------------------------------------------------
    // Nächsten Job einer Queue
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
    // Aktive Jobs
    //----------------------------------------------------------

    async findActive() {

        return this.model.findAll({

            where: {

                status: {

                    [Op.in]: [

                        "QUEUED",
                        "PRINTING"

                    ]

                }

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

            total:
                await this.count(),

            queued:
                await this.model.count({

                    where: {

                        status: "QUEUED"

                    }

                }),

            printing:
                await this.model.count({

                    where: {

                        status: "PRINTING"

                    }

                }),

            completed:
                await this.model.count({

                    where: {

                        status: "COMPLETED"

                    }

                }),

            cancelled:
                await this.model.count({

                    where: {

                        status: "CANCELLED"

                    }

                }),

            error:
                await this.model.count({

                    where: {

                        status: "ERROR"

                    }

                })

        };

    }

}

module.exports = JobRepository;