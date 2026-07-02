"use strict";

class Printer {

    constructor(options = {}) {

        this.id = options.id;
        this.name = options.name || "Unknown Printer";

        //--------------------------------------------------
        // Netzwerk
        //--------------------------------------------------

        this.protocol = options.protocol || "ipp";

        this.ip = options.ip || null;

        this.host = options.host || null;

        this.port = options.port || 631;

        this.uri = options.uri || null;

        //--------------------------------------------------
        // Hersteller
        //--------------------------------------------------

        this.manufacturer = options.manufacturer || "";

        this.model = options.model || "";

        this.serial = options.serial || "";

        this.location = options.location || "";

        //--------------------------------------------------
        // Status
        //--------------------------------------------------

        this.status = options.status || "UNKNOWN";

        this.busy = false;

        this.online = false;

        this.lastSeen = null;

        this.lastUpdate = null;

        //--------------------------------------------------
        // Fähigkeiten
        //--------------------------------------------------

        this.color = options.color ?? false;

        this.duplex = options.duplex ?? false;

        this.resolutions = options.resolutions || [];

        this.media = options.media || [];

        this.languages = options.languages || [];

        //--------------------------------------------------
        // Verbrauchsmaterial
        //--------------------------------------------------

        this.toner = options.toner || {};

        this.paper = options.paper || {};

        //--------------------------------------------------
        // Statistik
        //--------------------------------------------------

        this.jobsPrinted = 0;

        this.pagesPrinted = 0;

        this.errors = 0;

        //--------------------------------------------------
        // Treiber
        //--------------------------------------------------

        this.driver = options.driver || null;

        //--------------------------------------------------
        // Discovery
        //--------------------------------------------------

        this.discovery = options.discovery || {

            provider: null,

            firstSeen: new Date(),

            lastSeen: null

        };

    }

    //----------------------------------------------------------
    // Status
    //----------------------------------------------------------

    setStatus(status) {

        this.status = status;

        this.online = (

            status === "ONLINE" ||

            status === "PRINTING"

        );

        this.lastUpdate = new Date();

    }

    //----------------------------------------------------------

    touch() {

        this.lastSeen = new Date();

    }

    //----------------------------------------------------------

    incrementJobs() {

        this.jobsPrinted++;

    }

    //----------------------------------------------------------

    incrementPages(count = 1) {

        this.pagesPrinted += count;

    }

    //----------------------------------------------------------

    incrementErrors() {

        this.errors++;

    }

    //----------------------------------------------------------
    // JSON
    //----------------------------------------------------------

    toJSON() {

        return {

            id: this.id,

            name: this.name,

            protocol: this.protocol,

            ip: this.ip,

            host: this.host,

            port: this.port,

            uri: this.uri,

            manufacturer: this.manufacturer,

            model: this.model,

            serial: this.serial,

            location: this.location,

            status: this.status,

            online: this.online,

            busy: this.busy,

            color: this.color,

            duplex: this.duplex,

            resolutions: this.resolutions,

            media: this.media,

            languages: this.languages,

            toner: this.toner,

            paper: this.paper,

            jobsPrinted: this.jobsPrinted,

            pagesPrinted: this.pagesPrinted,

            errors: this.errors,

            lastSeen: this.lastSeen,

            lastUpdate: this.lastUpdate

        };

    }

}

module.exports = Printer;