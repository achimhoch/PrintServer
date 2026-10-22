"use strict";

const ApiError = require("../ApiError");

module.exports = (options = {}) => {

    return (req, res, next) => {

        if (!options.enabled) {

            return next();

        }
        const headerName = options.header || "X-API-Key"; 
        const apiKey = req.header(headerName);

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