"use strict";

const {

    DataTypes

} = require("sequelize");

module.exports = (sequelize) => {

    return sequelize.define(

        "Printer",

        {

            id: {

                type: DataTypes.STRING(64),

                primaryKey: true

            },

            name: {

                type: DataTypes.STRING(255),

                allowNull: false

            },

            protocol: {

                type: DataTypes.STRING(20),

                defaultValue: "ipp"

            },

            ip: {

                type: DataTypes.STRING(45),

                unique: true

            },

            host: {

                type: DataTypes.STRING(255)

            },

            port: {

                type: DataTypes.INTEGER,

                defaultValue: 631

            },

            uri: {

                type: DataTypes.STRING(512)

            },

            manufacturer: {

                type: DataTypes.STRING(100)

            },

            model: {

                type: DataTypes.STRING(100)

            },

            serial: {

                type: DataTypes.STRING(100)

            },

            location: {

                type: DataTypes.STRING(255)

            },

            status: {

                type: DataTypes.STRING(30),

                defaultValue: "UNKNOWN"

            },

            online: {

                type: DataTypes.BOOLEAN,

                defaultValue: false

            },

            busy: {

                type: DataTypes.BOOLEAN,

                defaultValue: false

            },

            color: {

                type: DataTypes.BOOLEAN,

                defaultValue: false

            },

            duplex: {

                type: DataTypes.BOOLEAN,

                defaultValue: false

            },

            resolutions: {

                type: DataTypes.JSON

            },

            media: {

                type: DataTypes.JSON

            },

            languages: {

                type: DataTypes.JSON

            },

            toner: {

                type: DataTypes.JSON

            },

            paper: {

                type: DataTypes.JSON

            },

            discovery: {

                type: DataTypes.JSON

            },

            jobsPrinted: {

                type: DataTypes.INTEGER,

                defaultValue: 0

            },

            pagesPrinted: {

                type: DataTypes.INTEGER,

                defaultValue: 0

            },

            errors: {

                type: DataTypes.INTEGER,

                defaultValue: 0

            },

            lastSeen: {

                type: DataTypes.DATE

            },

            lastUpdate: {

                type: DataTypes.DATE

            }

        },

        {

            tableName: "printers",
            timestamps: true

            /*indexes: [

                {

                    fields: [

                        "ip"

                    ]

                },

                {

                    fields: [

                        "status"

                    ]

                },

                {

                    fields: [

                        "manufacturer"

                    ]

                },

                {

                    fields: [

                        "location"

                    ]

                },

                {

                    fields: [

                        "online"

                    ]

                }

            ]*/

        }

    );

};