"use strict";

const { DataTypes, Sequelize } = require('sequelize');

module.exports = sequelize => {
    return sequelize.define("QueuePrinter", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            
        },

        queueId: {
            type: DataTypes.INTEGER,
            allowNull: false  
        },

        printerId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },


    },
    {
        tableName: "queue_printers",
        timestamps: true
    });
};