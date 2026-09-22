
const DiscoveryController = require("../../controllers/DiscoveryController");
const PagesRouter = require("../../PagesRouter");

class JobRoutes {

    constructor(bootstrap) { 

        this.controller = new DiscoveryController(bootstrap);

        this.router = new PagesRouter(this.controller);

        this.build();

    }

    //----------------------------------------------------------

    build() {

        this.router.get(

            "/",

            this.controller.list

        );

        

        

        return this.router.build();

    }

}

module.exports = JobRoutes;