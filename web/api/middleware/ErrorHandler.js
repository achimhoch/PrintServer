"use strict";

const ApiError = require("../ApiError");
const ApiResponse = require("../ApiResponse");

module.exports = (err, req, res, next) => {

    if (res.headersSent) {

        return next(err);

    }

    if (err instanceof ApiError) {

        return ApiResponse.error(

            res,

            err.status,

            err.message,

            err.details

        );

    }

    console.error(err);

    return ApiResponse.error(

        res,

        500,

        "Internal Server Error",

        process.env.NODE_ENV === "development"
            ? err.stack
            : undefined

    );

};