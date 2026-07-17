"use strict";

class DriverResult {

    constructor() {

        this.success = false;

        this.jobId = null;

        this.message = "";

        this.duration = 0;

        this.pages = 0;

        this.bytes = 0;

        this.driver = "";

        this.started = null;

        this.finished = null;

    }

}

module.exports = DriverResult;