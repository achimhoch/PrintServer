const MainController = require("../controllers/MainController");
const PagesRouter = require("../PagesRouter");

class MainRoutes {

    constructor(bootstrap) { 

        this.controller =

            new MainController(

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

            this.controller.main

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

module.exports = MainRoutes; 