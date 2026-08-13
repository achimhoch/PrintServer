"use strict";

const { DataTypes } = require("sequelize");

module.exports = sequelize => {

    return sequelize.define(

        "User",

        {

            id: {

                type: DataTypes.STRING(64),

                primaryKey: true

            },

            username: {

                type: DataTypes.STRING(255),

                allowNull: true

            },

            password: {

                type: DataTypes.STRING(1024),

                allowNull: true

            },

            rules: {

                type: DataTypes.INTEGER,
                defaultValue: 0
            },

           
            createdAt: {

                type: DataTypes.DATE,

                defaultValue: DataTypes.NOW

            },

            lastloggdAt: {

                type: DataTypes.DATE

            }

            

        },

        {

            tableName: "users",

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