"use strict";

class DriverCapabilities {

    constructor() {

        this.color = false;

        this.duplex = false;

        this.copies = true;

        this.collate = false;

        this.staple = false;

        this.holePunch = false;

        this.media = [];

        this.resolutions = [];

        this.languages = [];

    }

}

module.exports = DriverCapabilities;