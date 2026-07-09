"use strict";

const ApiError = require("../ApiError");

module.exports = schema => {

    return (req, res, next) => {

        if (!schema) {

            return next();

        }

        const {

            error,

            value

        } = schema.validate(

            req.body,

            {

                abortEarly: false,

                stripUnknown: true

            }

        );

        if (error) {

            return next(

                ApiError.badRequest(

                    "Validation failed",

                    error.details

                )

            );

        }

        req.body = value;

        next();

    };

};