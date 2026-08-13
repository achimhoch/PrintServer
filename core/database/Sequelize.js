"use strict";

const logger = require("../logging/LogManager").getLogger("Datenbank");
const { Sequelize } = require("sequelize");
const config = require("config");

const initModels = require("./models"); 

class Database {

    constructor() {

        this.sequelize = null;

        this.models = {};

    }

    //----------------------------------------------------------

    async connect() {

        if (this.sequelize)
            return this.sequelize;

        const db = config.get("database");

        this.sequelize = new Sequelize(

            db.database,
            db.username,
            db.password,

            {

                host: db.host,

                port: db.port,

                dialect: db.dialect,

                logging: false,

                timezone: db.timezone,

                pool: {

                    max: db.pool.max,

                    min: db.pool.min,

                    acquire: db.pool.acquire, 

                    idle: db.pool.idle

                }

            }

        );

        await this.sequelize.authenticate();

        logger.info("MySQL connected.");

        this.models = initModels(this.sequelize);


        if (db.sync) {

            await this.sequelize.sync({

                alter: db.alter

            });

        }

        return this.sequelize;

    }

    //----------------------------------------------------------

    async disconnect() {

        if (!this.sequelize)
            return;

        await this.sequelize.close();

        this.sequelize = null;

    }

    //----------------------------------------------------------

    model(name) {

        return this.models[name];

    }

}

module.exports = Database;