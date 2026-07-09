"use strict";

const ApiError = require("../ApiError");

module.exports = options => {

    return (req, res, next) => {

        if (!options.enabled) {

            return next();

        }

        const apiKey = req.header(

            "X-API-Key"

        );

        if (!apiKey) {

            return next(

                ApiError.unauthorized(

                    "Missing API key"

                )

            );

        }

        if (apiKey !== options.apiKey) {

            return next(

                ApiError.unauthorized(

                    "Invalid API key"

                )

            );

        }

        next();

    };

};