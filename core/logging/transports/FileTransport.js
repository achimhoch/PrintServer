"use strict";

const fs = require("fs");
const path = require("path");

class FileTransport {

    constructor(formatter, options = {}) {

        this.formatter = formatter;

        this.options = {

            directory: "./logs",

            filename: "printserver",

            extension: ".log",

            ...options

        };

        this.currentDate = null;

        this.file = null;

        this.ensureDirectory();

        this.rotate();

    }

    //----------------------------------------------------------
    // Log-Verzeichnis
    //----------------------------------------------------------

    ensureDirectory() {

        fs.mkdirSync(

            this.options.directory,

            {
                recursive: true
            }

        );

    }

    //----------------------------------------------------------
    // Aktuelles Datum
    //----------------------------------------------------------

    getDate() {

        const now = new Date();

        const year =
            now.getFullYear();

        const month =
            String(
                now.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                now.getDate()
            ).padStart(2, "0");

        return `${year}-${month}-${day}`;

    }

    //----------------------------------------------------------
    // Dateinamen erzeugen
    //----------------------------------------------------------

    getFilename(date) {

        return path.join(

            this.options.directory,

            `${this.options.filename}-${date}${this.options.extension}`

        );

    }

    //----------------------------------------------------------
    // Rotation prüfen
    //----------------------------------------------------------

    rotate() {

        const date =
            this.getDate();

        if (this.currentDate === date)
            return;

        this.currentDate = date;

        this.file =
            this.getFilename(date);

        this.ensureDirectory();

    }

    //----------------------------------------------------------
    // Schreiben
    //----------------------------------------------------------

    write(level, logger, message, data) {

        this.rotate();

        const line =

            this.formatter.format(

                level,

                logger,

                message,

                data

            ) + "\n";

        fs.appendFile(

            this.file,

            line,

            error => {

                if (error) {

                    console.error(

                        "Logging error:",

                        error

                    );

                }

            }

        );

    }

}

module.exports = FileTransport;