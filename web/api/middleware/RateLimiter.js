"use strict";

const rateLimit = require("express-rate-limit");

module.exports = options => {

    return rateLimit({

        windowMs: options.windowMs,

        max: options.max,

        standardHeaders: true,

        legacyHeaders: false

    });

};