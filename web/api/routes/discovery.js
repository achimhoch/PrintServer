const DiscoveryController = require("../controllers/DiscoveryController");
const ApiRouter = require("../ApiRouter");

class PrinterRoutes {

    constructor(bootstrap) { 

        this.controller = new DiscoveryController(

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

            this.controller.status

        );

       

        this.router.post(

            "/scan",

            this.controller.scan

        );

       

        

        return this.router.build();

    }

}

module.exports = PrinterRoutes;