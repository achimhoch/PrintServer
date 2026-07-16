const PrinterController = require("../controllers/PrinterController");
const ApiRouter = require("../ApiRouter");

class PrinterRoutes {

    constructor(bootstrap) {

        this.controller =

            new PrinterController(

                bootstrap

            );

        this.router =

            new ApiRouter(

                this.controller

            );

        this.build();

    }

    //----------------------------------------------------------

    build() {

        this.router.get(

            "/",

            this.controller.list

        );

        this.router.get(

            "/:id",

            this.controller.get

        );

        this.router.post(

            "/",

            this.controller.create

        );

        this.router.put(

            "/:id",

            this.controller.update

        );

        this.router.delete(

            "/:id",

            this.controller.remove

        );

        return this.router.build();

    }

}

module.exports = PrinterRoutes;