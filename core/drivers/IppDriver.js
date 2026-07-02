"use strict";

const ipp = require("ipp");
const Driver = require("./Driver");

class IppDriver extends Driver {

    constructor(options = {}) {

        super(options);

        this.host = options.ip;
        this.port = options.port || 631;
        this.path = options.path || "/ipp/print";

        this.uri = options.uri ||
            `http://${this.host}:${this.port}${this.path}`;

        this.timeout = options.timeout || 30000;

        this.client = ipp.Printer(this.uri);

    }

    //----------------------------------------------------------
    // Verbindung
    //----------------------------------------------------------

    async connect() {

        return true;

    }

    async disconnect() {

        return true;

    }

    //----------------------------------------------------------
    // Status lesen
    //----------------------------------------------------------

    async update() {

        const response = await this.execute(
            "Get-Printer-Attributes"
        );

        const attr = response["printer-attributes-tag"];

        return {

            status: this.convertState(

                attr["printer-state"]

            ),

            state: attr["printer-state"],

            jobs: attr["queued-job-count"] || 0,

            location: attr["printer-location"],

            model: attr["printer-make-and-model"],

            color: attr["color-supported"],

            duplex: attr["sides-supported"]

        };

    }

    //----------------------------------------------------------
    // Drucken
    //----------------------------------------------------------

    async print(job) {

        const response = await this.execute(

            "Print-Job",

            {

                "operation-attributes-tag": {

                    "requesting-user-name": job.user || "system",

                    "job-name": job.name || job.id,

                    "document-format":

                        job.mimeType ||

                        "application/pdf"

                },

                data: job.buffer

            }

        );

        const attr = response["job-attributes-tag"];

        return {

            id: attr["job-id"],

            uri: attr["job-uri"]

        };

    }

    //----------------------------------------------------------
    // Job abbrechen
    //----------------------------------------------------------

    async cancel(jobId) {

        return this.execute(

            "Cancel-Job",

            {

                "operation-attributes-tag": {

                    "job-id": jobId

                }

            }

        );

    }

    //----------------------------------------------------------
    // Pause
    //----------------------------------------------------------

    async pause() {

        return this.execute(

            "Pause-Printer"

        );

    }

    //----------------------------------------------------------
    // Fortsetzen
    //----------------------------------------------------------

    async resume() {

        return this.execute(

            "Resume-Printer"

        );

    }

    //----------------------------------------------------------
    // Testseite
    //----------------------------------------------------------

    async testPage() {

        throw new Error(

            "IPP besitzt keine standardisierte Testseite."

        );

    }

    //----------------------------------------------------------
    // Execute
    //----------------------------------------------------------

    execute(operation, payload = {}) {

        return new Promise((resolve, reject) => {

            this.client.execute(

                operation,

                payload,

                (err, result) => {

                    if (err)
                        return reject(err);

                    resolve(result);

                }

            );

        });

    }

    //----------------------------------------------------------
    // Status Mapping
    //----------------------------------------------------------

    convertState(state) {

        switch (state) {

            case 3:
                return "IDLE";

            case 4:
                return "PRINTING";

            case 5:
                return "STOPPED";

            default:
                return "UNKNOWN";

        }

    }

}

module.exports = IppDriver;