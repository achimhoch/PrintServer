"use strict";

const { Op } = require("sequelize");

const SequelizeRepository = require("./SequelizeRepository");
const { Queue } = require("../../database");

class QueueRepository extends SequelizeRepository {

    constructor() {

        super(Queue);

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
    // Status
    //----------------------------------------------------------

    async findByStatus(status) {

        return this.find({
            status
        });

    }

    //----------------------------------------------------------
    // Aktiv
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
    // Laufend
    //----------------------------------------------------------

    async findProcessing() {

        return this.find({
            processing: true
        });

    }

    //----------------------------------------------------------
    // Frei
    //----------------------------------------------------------

    async findIdle() {

        return this.find({

            processing: false,

            paused: false,

            enabled: true

        });

    }

    //----------------------------------------------------------
    // Priorität
    //----------------------------------------------------------

    async findByPriority(priority) {

        return this.find(
            {
                priority
            },
            {
                order: [
                    ["priority", "DESC"]
                ]
            }
        );

    }

    //----------------------------------------------------------
    // Warteschlangen mit Jobs
    //----------------------------------------------------------

    async findWithJobs() {

        return this.find({

            queuedJobs: {

                [Op.gt]: 0

            }

        });

    }

    //----------------------------------------------------------
    // Aktiver Job
    //----------------------------------------------------------

    async findActiveJob(jobId) {

        return this.first({

            activeJobId: jobId

        });

    }

    //----------------------------------------------------------
    // Name
    //----------------------------------------------------------

    async findByName(name) {

        return this.find(

            {

                name: {

                    [Op.like]: `%${name}%`

                }

            },

            {

                order: [

                    ["name", "ASC"]

                ]

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

            paused: await this.count({

                paused: true

            }),

            processing: await this.count({

                processing: true

            }),

            queuedJobs: await this.model.sum(

                "queuedJobs"

            ) || 0,

            completedJobs: await this.model.sum(

                "completedJobs"

            ) || 0,

            failedJobs: await this.model.sum(

                "failedJobs"

            ) || 0,

            cancelledJobs: await this.model.sum(

                "cancelledJobs"

            ) || 0

        };

    }

}

module.exports = QueueRepository;