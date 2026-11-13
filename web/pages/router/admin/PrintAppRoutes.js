"use strict";
const PagesRouter = require("../../PagesRouter");
const PrintAppPageController = require("../../controllers/PrintAppPageController");
class PrintAppRoutes {
    constructor(bootstrap) {
        this.controller = new PrintAppPageController(bootstrap);
        this.router = new PagesRouter(this.controller);
    }
    build() {
        this.router.get("/", this.controller.index);
        return this.router.build();
    }
}
module.exports = PrintAppRoutes;