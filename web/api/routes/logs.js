"use strict";

const LogController = require("../controllers/LogController");  

const ApiRouter = require("../ApiRouter");

class LogRoutes {


constructor(bootstrap) {

    this.controller = new LogController(bootstrap);

    this.router = new ApiRouter(this.controller);

    this.build();

}

//----------------------------------------------------------
// Routen
//----------------------------------------------------------

build() {

    //------------------------------------------------------
    // Weboberfläche
    //------------------------------------------------------

    this.router.get(

        "/",

        this.controller.page.bind(
            this.controller
        )

    );

    //------------------------------------------------------
    // Log-Dateien
    //------------------------------------------------------

    this.router.get(

        "/files",

        this.controller.files.bind(
            this.controller
        )

    );

    //------------------------------------------------------
    // Aktuelles Log
    //------------------------------------------------------

    this.router.get(

        "/today",

        this.controller.today.bind(
            this.controller
        )

    );

    //------------------------------------------------------
    // Bestimmte Log-Datei
    //------------------------------------------------------

    this.router.get(

        "/:filename",

        this.controller.get.bind(
            this.controller
        )

    );

    return this.router.build();

}


}

module.exports = LogRoutes;
