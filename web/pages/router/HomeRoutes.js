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
            (req, res) => {
                if (!req.auth || !req.auth.authenticated) {
                    res.redirect("/login");
                    return;
                }
                
                this.controller.Main

            }

            
        );

        this.router.get(

            "/login",
            (req, res) => this.controller.loginPage(req, res)   

        );

        this.router.post(

            "/auth/login",

            (req, res) => this.controller.login(req, res)

        );

        this.router.post(

            "/auth/logout",

            this.controller.logout

        );

        this.router.get(

            "/auth/me",
            (req, res) => this.controller.me(req, res)

        );

        

        

        return this.router.build();

    }

}

module.exports = MainRoutes; 