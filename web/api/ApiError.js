"use strict";

class ApiError extends Error {

    constructor(status, message, details = null) {

        super(message);

        this.name = "ApiError";

        this.status = status;

        this.details = details;

        Error.captureStackTrace(this, this.constructor);

    }

    //----------------------------------------------------------

    static badRequest(message = "Bad Request", details = null) {

        return new ApiError(400, message, details);

    }

    //----------------------------------------------------------

    static unauthorized(message = "Unauthorized") {

        return new ApiError(401, message);

    }

    //----------------------------------------------------------

    static forbidden(message = "Forbidden") {

        return new ApiError(403, message);

    }

    //----------------------------------------------------------

    static notFound(message = "Not Found") {

        return new ApiError(404, message);

    }

    //----------------------------------------------------------

    static conflict(message = "Conflict") {

        return new ApiError(409, message);

    }

    //----------------------------------------------------------

    static internal(error) {

        return new ApiError(

            500,

            error?.message || "Internal Server Error"

        );

    }

}

module.exports = ApiError;