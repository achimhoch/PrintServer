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

        

    }

    //----------------------------------------------------------

    build() {

        this.router.get(

            "/",

            this.controller.list   

        );

        this.router.post(

            "/login",

            this.controller.create

        );

        this.router.post(

            "/logout",

            this.controller.logout

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