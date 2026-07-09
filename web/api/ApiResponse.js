"use strict";

class ApiResponse {

    //----------------------------------------------------------
    // Erfolg
    //----------------------------------------------------------

    static ok(res, data = null, message = "OK") {

        return res.status(200).json({

            success: true,

            message,

            data,

            timestamp: new Date().toISOString()

        });

    }

    //----------------------------------------------------------
    // Erstellt
    //----------------------------------------------------------

    static created(res, data = null, message = "Created") {

        return res.status(201).json({

            success: true,

            message,

            data,

            timestamp: new Date().toISOString()

        });

    }

    //----------------------------------------------------------
    // Kein Inhalt
    //----------------------------------------------------------

    static noContent(res) {

        return res.sendStatus(204);

    }

    //----------------------------------------------------------
    // Fehler
    //----------------------------------------------------------

    static error(res, status = 500, message = "Internal Server Error", details = null) {

        return res.status(status).json({

            success: false,

            message,

            details,

            timestamp: new Date().toISOString()

        });

    }

}

module.exports = ApiResponse;