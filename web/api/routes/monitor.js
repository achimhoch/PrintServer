"use strict";

const ApiRouter = require("../ApiRouter");
const MonitorController =
    require("../controllers/MonitorController");

class MonitorRoutes {

    constructor(bootstrap) {

        this.controller =
            new MonitorController(
                bootstrap
            );

        this.router =
            new ApiRouter(
                this.controller
            );

        this.build();

    }

    //----------------------------------------------------------
    // Routen
    //----------------------------------------------------------

    build() {

        this.router.get(
            "/",
            this.controller.status.bind(
                this.controller
            )
        );

        this.router.get(
            "/overview",
            this.controller.overview.bind(
                this.controller
            )
        );

        this.router.get(
            "/printers",
            this.controller.printers.bind(
                this.controller
            )
        );

        this.router.post(
            "/start",
            this.controller.start.bind(
                this.controller
            )
        );

        this.router.post(
            "/stop",
            this.controller.stop.bind(
                this.controller
            )
        );

        this.router.post(
            "/tick",
            this.controller.tick.bind(
                this.controller
            )
        );

        return this.router.build();

    }

}

module.exports = MonitorRoutes;