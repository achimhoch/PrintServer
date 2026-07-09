"use strict";

const ApiResponse = require("../ApiResponse");

module.exports = (req, res) => {

    ApiResponse.error(

        res,

        404,

        "Endpoint not found"

    );

};