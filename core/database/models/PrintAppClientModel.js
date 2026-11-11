"use strict";

const { DataTypes } = require('sequelize');

module.exports = sequelize => {
     return sequelize.define("PrintAppClient", {
        id: { 
            type: DataTypes.INTEGER, 
            autoIncrement: true, 
            primaryKey: true 
        },

        clientId: { 
            type: DataTypes.STRING(64), 
            allowNull: false, 
            unique: true 
        },

        name: { 
            type: DataTypes.STRING(255), 
            allowNull: false 
        },

        userId: { 
            type: DataTypes.STRING(64), 
            allowNull: false
        },

        queueId: { 
            type: DataTypes.INTEGER, 
            allowNull: true 
        },

        apiKeyHash: { 
            type: DataTypes.STRING(64), 
            allowNull: false, 
            unique: true 
        },

        enabled: { 
            type: DataTypes.BOOLEAN, 
            allowNull: false, defaultValue: true 
        },

        status: { 
            type: DataTypes.STRING(16), 
            allowNull: false, 
            defaultValue: "offline" 
        },

        hostname: { 
            type: DataTypes.STRING(255), 
            allowNull: true 
        },

        platform: { 
            type: DataTypes.STRING(100), 
            allowNull: true 
        },

        version: { 
            type: DataTypes.STRING(50), 
            allowNull: true 
        },

        ipAddress: { 
            type: DataTypes.STRING(45), 
            allowNull: true 
        },

        lastSeen: { 
            type: DataTypes.DATE, 
            allowNull: true 
        },

        registeredAt: { 
            type: DataTypes.DATE, 
            allowNull: true 
        },

        revokedAt: { 
            type: DataTypes.DATE, 
            allowNull: true 
        }
    }, {
        tableName: "printapp_clients",
        timestamps: true,
        indexes: [
            { unique: true, fields: ["clientId"] },
            { unique: true, fields: ["apiKeyHash"] },
            { fields: ["userId"] },
            { fields: ["queueId"] },
            { fields: ["status"] }
        ]
    });
}