
const JobListController = require("../controllers/JobListController");
const PagesRouter = require("../PagesRouter");

class JobRoutes {

    constructor(bootstrap) { 

        this.controller =

            new JobListController(

                bootstrap

            );

        this.router =

            new PagesRouter(

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

module.exports = JobRoutes;