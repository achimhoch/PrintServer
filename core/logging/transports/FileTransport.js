"use strict";

const fs = require("fs");
const path = require("path");

class FileTransport {

    constructor(formatter, file) {

        this.formatter = formatter;
        this.now = new Date();

        this.file =
            file ||
            path.join(
                process.cwd(),
                "logs",
                `printserver_${this.now}.log`
            );

        fs.mkdirSync(

            path.dirname(this.file),

            { recursive: true }

        );

    }

    write(level, logger, message, data) {

        fs.appendFileSync(

            this.file,

            this.formatter.format(

                level,
                logger,
                message,
                data

            ) + "\n"

        );

    }

}

module.exports = FileTransport;