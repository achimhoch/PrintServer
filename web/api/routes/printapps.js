"use strict";
const ApiRouter = require("../ApiRouter");
const PrintAppController = require("../controllers/PrintAppController");

class PrintAppRoutes {
    constructor(bootstrap) {
        this.controller = new PrintAppController(bootstrap);
        this.router = new ApiRouter(this.controller);
        this.build();
    }
    build() {
        this.router.get("/", this.controller.list);
        this.router.get("/:id", this.controller.get);
        this.router.post("/", this.controller.create);
        this.router.put("/:id/assignment", this.controller.updateAssignment);
        this.router.post("/:id/revoke", this.controller.revoke);
        this.router.post("/:id/enable", this.controller.enable);
        return this.router.build();
    }
}
module.exports = PrintAppRoutes;