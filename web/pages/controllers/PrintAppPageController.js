"use strict";
class PrintAppPageController {
    constructor(bootstrap) { this.manager = bootstrap.printAppManager; }
    async index(req, res) {
        res.render("printapps/index", {
            pages: "admin", name: "PrintApp-Clients",
            authUser: req.auth?.user?.username || ""
        });
    }
}
module.exports = PrintAppPageController;