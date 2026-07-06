"use strict";

const {
    DataTypes
} = require("sequelize");

module.exports = sequelize => {

    return sequelize.define(

        "Job",

        {

            id: {

                type: DataTypes.STRING(64),

                primaryKey: true

            },

            name: {

                type: DataTypes.STRING(255),

                allowNull: false

            },

            document: {

                type: DataTypes.STRING(1024),

                allowNull: false

            },

            owner: {

                type: DataTypes.STRING(255)

            },

            printerId: {

                type: DataTypes.STRING(64),

                allowNull: false

            },

            queueId: {

                type: DataTypes.STRING(64),

                allowNull: false

            },

            status: {

                type: DataTypes.ENUM(

                    "QUEUED",
                    "SCHEDULED",
                    "PRINTING",
                    "PAUSED",
                    "COMPLETED",
                    "CANCELLED",
                    "ERROR"

                ),

                defaultValue: "QUEUED"

            },

            priority: {

                type: DataTypes.INTEGER,

                defaultValue: 50

            },

            copies: {

                type: DataTypes.INTEGER,

                defaultValue: 1

            },

            pages: {

                type: DataTypes.INTEGER,

                defaultValue: 0

            },

            printedPages: {

                type: DataTypes.INTEGER,

                defaultValue: 0

            },

            color: {

                type: DataTypes.BOOLEAN,

                defaultValue: false

            },

            duplex: {

                type: DataTypes.BOOLEAN,

                defaultValue: false

            },

            media: {

                type: DataTypes.STRING(50),

                defaultValue: "A4"

            },

            language: {

                type: DataTypes.STRING(50),

                defaultValue: "PDF"

            },

            spoolFile: {

                type: DataTypes.STRING(1024)

            },

            options: {

                type: DataTypes.JSON

            },

            submittedAt: {

                type: DataTypes.DATE,

                defaultValue: DataTypes.NOW

            },

            startedAt: {

                type: DataTypes.DATE

            },

            finishedAt: {

                type: DataTypes.DATE

            },

            error: {

                type: DataTypes.TEXT

            }

        },

        {

            tableName: "jobs",

            /*indexes: [

                {

                    fields: [

                        "printerId"

                    ]

                },

                {

                    fields: [

                        "queueId"

                    ]

                },

                {

                    fields: [

                        "status"

                    ]

                },

                {

                    fields: [

                        "owner"

                    ]

                },

                {

                    fields: [

                        "priority"

                    ]

                },

                {

                    fields: [

                        "submittedAt"

                    ]

                }

            ]*/

        }

    );

};