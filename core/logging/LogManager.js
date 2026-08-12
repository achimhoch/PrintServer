"use strict";

const Logger = require("./Logger");

const Formatter = require("./formatter/Formatter");

const ConsoleTransport = require("./transports/ConsoleTransport");

const FileTransport = require("./transports/FileTransport");

class LogManager {

    constructor() {

        const formatter =

            new Formatter();

        this.transports = [

            new ConsoleTransport(formatter),

            new FileTransport(formatter)

        ];

    }

    getLogger(name) {

        return new Logger(

            name,

            this

        );

    }

    write(level, logger, message, data) {

        for (const transport of this.transports) {

            transport.write(

                level,

                logger,

                message,

                data

            );

        }

    }

}

module.exports = new LogManager();