s
"use strict";

const ApiError = require("../ApiError");

module.exports = (...roles) => {

    return (req, res, next) => {

        if (!roles.length) {

            return next();

        }

        const role = req.user?.role;

        if (!roles.includes(role)) {

            return next(

                ApiError.forbidden(

                    "Permission denied"

                )

            );

        }

        next();

    };

};