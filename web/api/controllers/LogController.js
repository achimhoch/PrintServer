"use strict";

const fs = require("fs");
const path = require("path");

class LogController {

constructor(bootstrap) {

    this.bootstrap = bootstrap;

    const logging =
        bootstrap &&
        bootstrap.config &&
        bootstrap.config.has("logging")
            ? bootstrap.config.get("logging")
            : {};

    this.directory = path.resolve(
        logging.directory || "./logs"
    );

    this.filename =
        logging.filename ||
        "printserver";

    this.extension =
        logging.extension ||
        ".log";

    this.maxLines =
        Number(logging.maxLines) || 1000;

}

//----------------------------------------------------------
// Log-Dateien
//----------------------------------------------------------

files(req, res) {

    try {

        if (!fs.existsSync(this.directory)) {

            return res.json({

                success: true,

                data: []

            });

        }

        const files =
            fs.readdirSync(
                this.directory
            )
            .filter(file =>
                this.isLogFile(file)
            )
            .map(file => {

                const fullPath =
                    path.join(
                        this.directory,
                        file
                    );

                const stat =
                    fs.statSync(fullPath);

                return {

                    name: file,

                    size: stat.size,

                    modified:
                        stat.mtime

                };

            })
            .sort(
                (a, b) =>
                    new Date(b.modified) -
                    new Date(a.modified)
            );

        res.json({

            success: true,

            data: files

        });

    }
    catch (err) {

        console.error(
            "LogController.files:",
            err
        );

        res.status(500).json({

            success: false,

            error: err.message

        });

    }

}

//----------------------------------------------------------
// Aktuelle Log-Datei
//----------------------------------------------------------

today(req, res) {

    try {

        const date =
            this.getDate();

        const filename =
            `${this.filename}-${date}${this.extension}`;

        return this.readFile(
            filename,
            req,
            res
        );

    }
    catch (err) {

        console.error(
            "LogController.today:",
            err
        );

        res.status(500).json({

            success: false,

            error: err.message

        });

    }

}

//----------------------------------------------------------
// Bestimmte Log-Datei
//----------------------------------------------------------

get(req, res) {

    try {

        const filename =
            req.params.filename;

        if (!filename) {

            return res.status(400).json({

                success: false,

                error: "Filename is required."

            });

        }

        if (!this.isLogFile(filename)) {

            return res.status(400).json({

                success: false,

                error: "Invalid log filename."

            });

        }

        return this.readFile(
            filename,
            req,
            res
        );

    }
    catch (err) {

        console.error(
            "LogController.get:",
            err
        );

        res.status(500).json({

            success: false,

            error: err.message

        });

    }

}

//----------------------------------------------------------
// Log-Datei lesen
//----------------------------------------------------------

readFile(filename, req, res) {

    const fullPath =
        path.resolve(
            this.directory,
            filename
        );

    //------------------------------------------------------
    // Path Traversal verhindern
    //------------------------------------------------------

    const directory =
        path.resolve(
            this.directory
        );

    if (
        !fullPath.startsWith(
            directory + path.sep
        )
    ) {

        return res.status(400).json({

            success: false,

            error: "Invalid log path."

        });

    }

    if (!fs.existsSync(fullPath)) {

        return res.status(404).json({

            success: false,

            error: "Log file not found."

        });

    }

    const stat =
        fs.statSync(fullPath);

    if (!stat.isFile()) {

        return res.status(404).json({

            success: false,

            error: "Log file not found."

        });

    }

    const content =
        fs.readFileSync(
            fullPath,
            "utf8"
        );

    const lines =
        content
            .split(/\r?\n/)
            .filter(line => line.length > 0);

    //------------------------------------------------------
    // Anzahl Zeilen
    //------------------------------------------------------

    let limit =
        Number(req.query.lines);

    if (
        !Number.isInteger(limit) ||
        limit <= 0
    ) {

        limit = this.maxLines;

    }

    limit =
        Math.min(
            limit,
            10000
        );

    //------------------------------------------------------
    // Letzte Zeilen
    //------------------------------------------------------

    const result =
        lines.slice(-limit);

    res.json({

        success: true,

        data: {

            file: filename,

            lines: result,

            count: result.length,

            total: lines.length,

            modified:
                stat.mtime

        }

    });

}

//----------------------------------------------------------
// Web-Seite
//----------------------------------------------------------

page(req, res) {

    res.render(
        "logs/adminlogs",
        {

            title:
                "PrintServer Logs",

            logDirectory:
                this.directory,

            maxLines:
                this.maxLines

        }

    );

}

//----------------------------------------------------------
// Prüfen Log-Datei
//----------------------------------------------------------

isLogFile(filename) {

    if (
        typeof filename !==
        "string"
    ) {

        return false;

    }

    //------------------------------------------------------
    // Nur unser eigenes Log-Dateiformat akzeptieren
    //------------------------------------------------------

    const prefix =
        `${this.filename}-`;

    return (
        filename.startsWith(prefix) &&
        filename.endsWith(this.extension) &&
        !filename.includes("/") &&
        !filename.includes("\\")
    );

}

//----------------------------------------------------------
// Datum
//----------------------------------------------------------

getDate() {

    const now =
        new Date();

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

}

module.exports = LogController;
