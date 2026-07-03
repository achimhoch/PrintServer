"use strict";

const { Sequelize } = require("sequelize");
const config = require("config");

const db = config.get("database");

const sequelize = new Sequelize(

    db.database,

    db.username,

    db.password,

    {

        host: db.host,

        port: db.port,

        dialect: db.dialect,

        logging: db.logging,

        pool: {

            max: db.pool.max,

            min: db.pool.min,

            acquire: 30000,

            idle: db.pool.idle

        },

        define: {

            underscored: true,

            freezeTableName: true,

            timestamps: true,

            paranoid: false

        }

    }

);

module.exports = sequelize;