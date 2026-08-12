"use strict";

const levels = require("./levels");

class Logger {

    constructor(name, manager) {

        this.name = name;

        this.manager = manager;

    }

    log(level, message, data) {

        this.manager.write(

            level,

            this.name,

            message,

            data

        );

    }

    trace(msg, data) {

        this.log("TRACE", msg, data);

    }

    debug(msg, data) {

        this.log("DEBUG", msg, data);

    }

    info(msg, data) {

        this.log("INFO", msg, data);

    }

    warn(msg, data) {

        this.log("WARN", msg, data);

    }

    error(msg, data) {

        this.log("ERROR", msg, data);

    }

    fatal(msg, data) {

        this.log("FATAL", msg, data);

    }

}

module.exports = Logger;