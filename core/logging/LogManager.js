"use strict";

const config = require("config");

const Logger = require("./Logger");

const Formatter =
    require("./formatter/Formatter");

const ConsoleTransport =
    require("./transports/ConsoleTransport");

const FileTransport =
    require("./transports/FileTransport");

class LogManager {

    constructor() {

        this.transports = [];

        const logging =
            config.has("logging")
                ? config.get("logging")
                : {};

        const formatter =
            new Formatter();

        //------------------------------------------------------
        // Console
        //------------------------------------------------------

        if (logging.console !== false) {

            this.transports.push(

                new ConsoleTransport(

                    formatter

                )

            );

        }

        //------------------------------------------------------
        // Datei
        //------------------------------------------------------

        if (logging.file !== false) {

            this.transports.push(

                new FileTransport(

                    formatter,

                    {

                        directory:
                            logging.directory ||
                            "./logs",

                        filename:
                            logging.filename ||
                            "printserver",

                        extension:
                            logging.extension ||
                            ".log"

                    }

                )

            );

        }

    }

    //----------------------------------------------------------
    // Logger erzeugen
    //----------------------------------------------------------

    getLogger(name) {

        return new Logger(

            name,

            this

        );

    }

    //----------------------------------------------------------
    // Schreiben
    //----------------------------------------------------------

    write(

        level,
        logger,
        message,
        data

    ) {

        for (

            const transport
            of this.transports

        ) {

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