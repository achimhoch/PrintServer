"use strict";

const { Op } = require("sequelize");

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

    async findByUser(user) {

        return this.find({

            user

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

    async findPending() {

        return this.find({

            status: "pending"

        });

    }

    async findQueued() {

        return this.find({

            status: "queued"

        });

    }

    async findPrinting() {

        return this.find({

            status: "printing"

        });

    }

    async findCompleted() {

        return this.find({

            status: "completed"

        });

    }

    async findFailed() {

        return this.find({

            status: "failed"

        });

    }

    async findCancelled() {

        return this.find({

            status: "cancelled"

        });

    }

    //----------------------------------------------------------
    // Priorität
    //----------------------------------------------------------

    async nextJob(queueId) {

        return this.model.findOne({

            where: {

                queueId,

                status: "queued"

            },

            order: [

                ["priority", "DESC"],

                ["createdAt", "ASC"]

            ]

        });

    }

    //----------------------------------------------------------
    // Alte Jobs
    //----------------------------------------------------------

    async findOlderThan(date) {

        return this.model.findAll({

            where: {

                createdAt: {

                    [Op.lt]: date

                }

            }

        });

    }

    //----------------------------------------------------------
    // Statistik
    //----------------------------------------------------------

    async stats() {

        return {

            total: await this.count(),

            pending: await this.count({

                status: "pending"

            }),

            queued: await this.count({

                status: "queued"

            }),

            printing: await this.count({

                status: "printing"

            }),

            completed: await this.count({

                status: "completed"

            }),

            failed: await this.count({

                status: "failed"

            }),

            cancelled: await this.count({

                status: "cancelled"

            })

        };

    }

}

module.exports = JobRepository;