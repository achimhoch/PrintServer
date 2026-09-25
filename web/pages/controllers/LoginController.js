"use strict";

class LoginController {

    constructor(bootstrap) {

        this.bootstrap =
            bootstrap;

        this.authService = bootstrap.authService;

    }

    // ---------------------------------------------------------
    // Login-Seite
    // ---------------------------------------------------------

    async loginPage(req, res) {

        if (req.auth && req.auth.user) {

            res.redirect("/");

            return;

        }

        res.render(
            "login",
            {
                title: "Anmeldung",
                error: null
            }
        );

    }

    // ---------------------------------------------------------
    // Login API
    // ---------------------------------------------------------

    async login(logindata) {
    //console.log(logindata);
        try {

            const {
                user,
                passwort
            } = logindata || {};

            if (!user || !passwort) {
                let request = ({
                    login: {
                    status: 400,
                    success: false,

                    error:
                        "Benutzername und Passwort sind erforderlich."
                    }
                });

                return request;

            }

            const session =
                await this.authService.login(
                    user,
                    passwort
                );

            if (!session) {

                //res.status(401).json({
                let request = ({
                    session: {
                    status: 401,
                    success: false,

                    error:
                        "Benutzername oder Passwort ist ungültig."
                    }
                });

                return request;

            }

            this.setCookie(
                //res,
                session.id
            );

            let request = ({
                cookie: {
                success: true,

                user:
                    session.user
                }
            });

            return request;

        }
        catch (error) {

            /*req.log?.error?.(
                error
            );*/

            //res.status(500).json({
            let request = ({
                error: {
                status: 500,
                success: false,

                error:
                    "Anmeldung konnte nicht durchgeführt werden."
            }
            });

        }

    }

    // ---------------------------------------------------------
    // Logout
    // ---------------------------------------------------------

    async logout(req, res) {

        const sessionId =
            req.auth?.sessionId;

        if (sessionId) {

            this.authService.logout(
                sessionId
            );

        }

        res.clearCookie(
            this.getCookieName()
        );

        res.json({

            success: true

        });

    }

    // ---------------------------------------------------------
    // Aktueller Benutzer
    // ---------------------------------------------------------

    async me(req, res) {

        if (!req.auth?.user) {

            res.status(401).json({

                authenticated: false

            });

            return;

        }

        res.json({

            authenticated: true,

            user:
                req.auth.user

        });

    }

    // ---------------------------------------------------------
    // Cookie
    // ---------------------------------------------------------

    setCookie(res, sessionId) {

        const config =
            require("config");

        const cookie =
            config.get(
                "authentication.session.cookie"
            );

        res.cookie(
            this.getCookieName(),
            sessionId,
            cookie
        );

    }

    getCookieName() {

        const config =
            require("config");

        return config.get(
            "authentication.session.cookieName"
        );

    }

}

module.exports = LoginController;
