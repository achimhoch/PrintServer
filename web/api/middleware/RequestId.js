"use strict";

const crypto = require("crypto");

module.exports = () => {

    return (req, res, next) => {

        const id = crypto.randomUUID();

        req.id = id;

        res.setHeader(

            "X-Request-ID",

            id

        );

        next();

    };

};