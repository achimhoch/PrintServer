"use strict";

const ApiResponse = require("./ApiResponse");

class ApiController {

    constructor(bootstrap) {

        this.bootstrap = bootstrap;

    }

    //----------------------------------------------------------
    // Erfolgsantwort
    //----------------------------------------------------------

    ok(res, data, message) {

        return ApiResponse.ok(

            res,

            data,

            message

        );

    }

    //----------------------------------------------------------

    created(res, data, message) {

        return ApiResponse.created(

            res,

            data,

            message

        );

    }

    //----------------------------------------------------------

    noContent(res) {

        return ApiResponse.noContent(res);

    }

    //----------------------------------------------------------

    error(next, err) {

        next(err);

    }

}

module.exports = ApiController;