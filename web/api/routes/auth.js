
"use strict";

const ApiRouter = require("../ApiRouter");
const AuthController = require("../controllers/AuthController");
const logger = require("../../../core/logging/LogManager").getLogger("AuthRoutes");


class AuthRoutes {

    constructor(bootstrap) {

        this.bootstrap = bootstrap;
        this.controller = new AuthController(bootstrap);
        this.router = new ApiRouter(this.controller);
    }


    // =========================================================   
    // BUILD
    // ========================================================= 

    build() {

        // -----------------------------------------------------
        // Login
        // -----------------------------------------------------
        /*this.router.get(
            "/",

            (req, res) => this.controller.loginPage(req, res)
        );*/


        this.router.post(
            "/login",

            /*express.urlencoded({
                extended: false
            }),*/
         
                (req, res) => this.controller.login(req, res)

           

            
        );


        // -----------------------------------------------------
        // Logout
        // -----------------------------------------------------

        this.router.post(
            "/logout",

            async (req, res) => {

                try {

                    await this.controller.logout(
                        req,
                        res
                    );

                }
                catch (error) {

                    logger.error(
                        "Fehler bei /api/auth/logout",
                        error
                    );

                    if (!res.headersSent) {

                        res.status(500).json({
                            success: false,
                            error: "LOGOUT_ERROR"
                        });

                    }

                }

            }
        );


        // -----------------------------------------------------
        // Aktuelle Session / Benutzer
        // -----------------------------------------------------

        this.router.get(
            "/me",

            async (req, res) => {

                try {

                    await this.authController.me(
                        req,
                        res
                    );

                }
                catch (error) {

                    logger.error(
                        "Fehler bei /api/auth/me",
                        error
                    );

                    if (!res.headersSent) {

                        res.status(500).json({
                            success: false,
                            error: "SESSION_ERROR"
                        });

                    }

                }

            }
        );


        logger.info(
            "AuthRoutes aufgebaut"
        );


        return this.router.build();

    }

}


module.exports = AuthRoutes;

