"use strict";

const ipp = require("ipp");
const EventEmitter = require("events");
//const config = require('config');

class IppDriver extends EventEmitter {

    constructor(options = {}) {

        super();

        this.protocol = "ipp";

        this.options = {

            timeout: 10000,

            ...options

        };

    }

    //----------------------------------------------------------
    // Verbindung erzeugen
    //----------------------------------------------------------

    createPrinter(printer) {

        if (!printer.uri) {

            throw new Error("Printer URI fehlt.");

        }

        return ipp.Printer(printer.uri);

    }

    //----------------------------------------------------------
    // Druckerinformationen
    //----------------------------------------------------------

    async getAttributes(printer) {

        const device = this.createPrinter(printer);

        return new Promise((resolve, reject) => {

            device.execute(

                "Get-Printer-Attributes",

                null,

                (err, result) => {

                    if (err)
                        return reject(err);

                    resolve(result);

                }

            );

        });

    }

    //----------------------------------------------------------
    // Druckstatus
    //----------------------------------------------------------

    async getStatus(printer) {

        const result = await this.getAttributes(printer);

        return result["printer-attributes-tag"] || {};

    }

    //----------------------------------------------------------
    // Druckjob senden
    //----------------------------------------------------------

    async print(printer, job) {

        const device = this.createPrinter(printer);

        const message = {

            "operation-attributes-tag": {

                "requesting-user-name":

                    job.user || "PrintServer",

                "job-name":

                    job.name || "Print Job",

                "document-format":

                    job.mimeType || "application/pdf"

            },

            data: job.data

        };

        return new Promise((resolve, reject) => {

            device.execute(

                "Print-Job",

                message,

                (err, result) => {

                    if (err) {

                        this.emit("error", err);

                        return reject(err);

                    }

                    this.emit(

                        "jobPrinted",

                        {

                            printer,

                            job,

                            result

                        }

                    );

                    resolve(result);

                }

            );

        });

    }

    //----------------------------------------------------------
    // Job abbrechen
    //----------------------------------------------------------

    async cancelJob(printer, jobId) {

        const device = this.createPrinter(printer);

        const message = {

            "operation-attributes-tag": {

                "job-id": jobId

            }

        };

        return new Promise((resolve, reject) => {

            device.execute(

                "Cancel-Job",

                message,

                (err, result) => {

                    if (err)
                        return reject(err);

                    resolve(result);

                }

            );

        });

    }

    //----------------------------------------------------------
    // Warteschlange
    //----------------------------------------------------------

    async getJobs(printer) {

        const device = this.createPrinter(printer);

        return new Promise((resolve, reject) => {

            device.execute(

                "Get-Jobs",

                null,

                (err, result) => {

                    if (err)
                        return reject(err);

                    resolve(result);

                }

            );

        });

    }

    //----------------------------------------------------------
    // Verbindung testen
    //----------------------------------------------------------

    async ping(printer) {

        try {

            await this.getAttributes(printer);

            return true;

        }
        catch {

            return false;

        }

    }

    //----------------------------------------------------------
    // Fähigkeiten
    //----------------------------------------------------------

    async getCapabilities(printer) {

        const attributes = await this.getAttributes(printer);

        return attributes["printer-attributes-tag"] || {};

    }

}

module.exports = IppDriver;