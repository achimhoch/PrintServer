"use strict";

const {
    DataTypes
} = require("sequelize");

module.exports = sequelize => {

    return sequelize.define(

        "Queue",

        {

            id: {

                type: DataTypes.STRING(64),

                primaryKey: true

            },

            name: {

                type: DataTypes.STRING(255),

                allowNull: false

            },

            printerId: {

                type: DataTypes.STRING(64),

                allowNull: false,

                unique: true

            },

            enabled: {

                type: DataTypes.BOOLEAN,

                defaultValue: true

            },

            paused: {

                type: DataTypes.BOOLEAN,

                defaultValue: false

            },

            status: {

                type: DataTypes.STRING(32),

                defaultValue: "READY"

            },

            priority: {

                type: DataTypes.INTEGER,

                defaultValue: 50

            },

            maxConcurrentJobs: {

                type: DataTypes.INTEGER,

                defaultValue: 1

            },

            retryCount: {

                type: DataTypes.INTEGER,

                defaultValue: 3

            },

            retryDelay: {

                type: DataTypes.INTEGER,

                defaultValue: 30000

            },

            spoolDirectory: {

                type: DataTypes.STRING(1024)

            },

            processing: {

                type: DataTypes.BOOLEAN,

                defaultValue: false

            },

            activeJobId: {

                type: DataTypes.STRING(64)

            },

            queuedJobs: {

                type: DataTypes.INTEGER,

                defaultValue: 0

            },

            completedJobs: {

                type: DataTypes.INTEGER,

                defaultValue: 0

            },

            failedJobs: {

                type: DataTypes.INTEGER,

                defaultValue: 0

            },

            cancelledJobs: {

                type: DataTypes.INTEGER,

                defaultValue: 0

            },

            lastJobStarted: {

                type: DataTypes.DATE

            },

            lastJobFinished: {

                type: DataTypes.DATE

            },

            options: {

                type: DataTypes.JSON

            }

        },

        {

            tableName: "queues",

            /*indexes: [

                {

                    fields: [

                        "printerId"

                    ]

                },

                {

                    fields: [

                        "status"

                    ]

                },

                {

                    fields: [

                        "enabled"

                    ]

                },

                {

                    fields: [

                        "paused"

                    ]

                },

                {

                    fields: [

                        "priority"

                    ]

                }

            ]*/

        }

    );

};