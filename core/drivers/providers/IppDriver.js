"use strict";

const ipp = require("ipp");

const Driver = require("../Driver");

class IppDriver extends Driver {

    constructor(options = {}) {

        super("ipp");

        this.version = "2.0.0";

        this.options = {

            timeout: 10000,

            retries: 3,

            ...options

        };

    }

    //----------------------------------------------------------
    // Initialisieren
    //----------------------------------------------------------

    async initialize() {

    }

    //----------------------------------------------------------
    // Start
    //----------------------------------------------------------

    async start() {

        this.running = true;

    }

    //----------------------------------------------------------
    // Stop
    //----------------------------------------------------------

    async stop() {

        this.running = false;

    }

    //----------------------------------------------------------
    // IPP Verbindung
    //----------------------------------------------------------

    connect(uri) {

        return new ipp.Printer(uri);

    }

    //----------------------------------------------------------
    // Druckauftrag
    //----------------------------------------------------------

    async print(printer, job) {

        const device = this.connect(

            printer.uri

        );

        return new Promise((resolve, reject) => {

            device.execute(

                "Print-Job",

                {

                    "operation-attributes-tag": {

                        "requesting-user-name":

                            job.user || "system",

                        "job-name":

                            job.name || "Print Job",

                        "document-format":

                            job.mime ||

                            "application/pdf"

                    },

                    data: job.data

                },

                (err, response) => {

                    if (err)

                        return reject(err);

                    resolve(response);

                }

            );

        });

    }

    //----------------------------------------------------------
    // Druckauftrag abbrechen
    //----------------------------------------------------------

    async cancelJob(printer, jobId) {

        const device = this.connect(

            printer.uri

        );

        return new Promise((resolve, reject) => {

            device.execute(

                "Cancel-Job",

                {

                    "operation-attributes-tag": {

                        "job-id": jobId

                    }

                },

                (err, result) => {

                    if (err)

                        return reject(err);

                    resolve(result);

                }

            );

        });

    }

    //----------------------------------------------------------
    // Druckerattribute
    //----------------------------------------------------------

    async getPrinterAttributes(printer) {

        const device = this.connect(

            printer.uri

        );

        return new Promise((resolve, reject) => {

            device.execute(

                "Get-Printer-Attributes",

                null,

                (err, result) => {

                    if (err)

                        return reject(err);

                    const attr =

                        result["printer-attributes-tag"];

                    resolve({

                        uri:

                            printer.uri,

                        uuid:

                            attr["printer-uuid"],

                        name:

                            attr["printer-name"],

                        location:

                            attr["printer-location"],

                        manufacturer:

                            attr["printer-make-and-model"],

                        model:

                            attr["printer-make-and-model"],

                        state:

                            attr["printer-state"],

                        color:

                            attr["color-supported"],

                        duplex:

                            attr["sides-supported"],

                        raw: attr

                    });

                }

            );

        });

    }

    //----------------------------------------------------------
    // Queueinformationen
    //----------------------------------------------------------

    async getQueueAttributes(printer) {

        const device = this.connect(

            printer.uri

        );

        return new Promise((resolve, reject) => {

            device.execute(

                "Get-Printer-Attributes",

                null,

                (err, result) => {

                    if (err)

                        return reject(err);

                    resolve(

                        result["printer-attributes-tag"]

                    );

                }

            );

        });

    }

    //----------------------------------------------------------
    // Jobs
    //----------------------------------------------------------

    async getJobs(printer) {

        const device = this.connect(

            printer.uri

        );

        return new Promise((resolve, reject) => {

            device.execute(

                "Get-Jobs",

                null,

                (err, result) => {

                    if (err)

                        return reject(err);

                    resolve(

                        result["job-attributes-tag"] || []

                    );

                }

            );

        });

    }

    //----------------------------------------------------------
    // Jobinformationen
    //----------------------------------------------------------

    async getJob(printer, jobId) {

        const jobs = await this.getJobs(

            printer

        );

        return jobs.find(

            job => job["job-id"] === jobId

        );

    }

    //----------------------------------------------------------
    // Fähigkeiten
    //----------------------------------------------------------

    async capabilities(printer) {

        const info =

            await this.getPrinterAttributes(

                printer

            );

        return {

            color: info.color,

            duplex: info.duplex,

            manufacturer: info.manufacturer,

            model: info.model

        };

    }

    //----------------------------------------------------------
    // Status
    //----------------------------------------------------------

    async status(printer) {

        const info =

            await this.getPrinterAttributes(

                printer

            );

        return {

            online: true,

            state: info.state,

            location: info.location

        };

    }

    //----------------------------------------------------------
    // Pause
    //----------------------------------------------------------

    async pausePrinter(printer) {

        const device = this.connect(

            printer.uri

        );

        return new Promise((resolve, reject) => {

            device.execute(

                "Pause-Printer",

                {},

                (err, result) => {

                    if (err)

                        return reject(err);

                    resolve(result);

                }

            );

        });

    }

    //----------------------------------------------------------
    // Fortsetzen
    //----------------------------------------------------------

    async resumePrinter(printer) {

        const device = this.connect(

            printer.uri

        );

        return new Promise((resolve, reject) => {

            device.execute(

                "Resume-Printer",

                {},

                (err, result) => {

                    if (err)

                        return reject(err);

                    resolve(result);

                }

            );

        });

    }

}

module.exports = IppDriver;