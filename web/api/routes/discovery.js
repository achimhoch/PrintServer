const DiscoveryController = require("../controllers/DiscoveryController"); 
const ApiRouter = require("../ApiRouter");

class DiscoveryRoutes {

    constructor(bootstrap) { 

        this.controller = new DiscoveryController(bootstrap);

        this.router = new ApiRouter(this.controller);

        

    }

    //---------------------------------------------------------- 

    build() {

        this.router.post(

            "/scan",

            this.controller.scan

        );

       

        this.router.get(

            "/status",

            this.controller.status

        );


        this.router.get(
            "/test",
            this.controller.list
        );

       

        

        return this.router.build();

    }

}

module.exports = DiscoveryRoutes;