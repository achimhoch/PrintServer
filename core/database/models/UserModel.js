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

            queueId: {
                type: DataTypes.INTEGER,
                allowNull: true,
               
            },

            rules: {

                type: DataTypes.INTEGER,
                defaultValue: 0
            },

           
            createdAt: {

                type: DataTypes.DATE,

                defaultValue: DataTypes.NOW

            },

            lastloggedAt: {

                type: DataTypes.DATE

            }

            

        },

        {

            tableName: "users",

            /*indexes: [

                {

                    fields: [

                        "queueId"

                    ]

                },

               

            ]*/

        }

    );

};