"use strict";

class ConsoleTransport {

    constructor(formatter) {

        this.formatter = formatter;

    }

    write(level, logger, message, data) {

        console.log(

            this.formatter.format(

                level,
                logger,
                message,
                data

            )

        );

    }

}

module.exports = ConsoleTransport;