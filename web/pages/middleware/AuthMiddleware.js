"use strict";

const config = require("config");
const logger = require("../../../core/logging/LogManager").getLogger("AuthMiddleware"); 

class AuthMiddleware {

    constructor(authService) { 

        this.authService = authService;
        this.cookieName = this.getConfig("authentication.session.cookieName", "printserver.sid");

    }
    //----------------------------------------------------------
    //Config
    //----------------------------------------------------------
    getConfig(path, fallback = null) {
        try {
            if (config.has(path)) {
                return config.get(path);
            }
        }
        catch (error) {
            logger.warn(`Konfiguration nicht verfügbar: ${path}`);
        }

        return fallback;
    }

    //----------------------------------------------------------
    //Session ermitteln
    //----------------------------------------------------------
    getSession(req) {
        if (!req || !req.cookies) {
            return null;
        }

        return req.cookies[this.cookieName] || null;
    }

    // ---------------------------------------------------------
    // Session lesen
    // ---------------------------------------------------------

    authenticate() {

        return (req, res, next) => {

            try {
           
                //const cookieName = config.get("authentication.session.cookieName");
                //const sessionId = req.cookies?.[cookieName];
                const sessionId = this.getSession(req);

                if (!sessionId) {
                    req.auth = null;
                    req.user = null;

                    return next();
                }

                const session = this.authService.getSession(sessionId);

                //ungültige/abgelaufene Session
                if (!session) {
                    req.auth = null;
                    req.user = null;
                    this.clearCookie(res);

                    logger.debug("Ungültige oder abgelaufene Session")

                    return next();
                }

                const user = this.authService.getUser(sessionId);
                    
                req.auth = {

                    authenticated: true,
                    sessionId: session.id,
                    user: session.user

                };

                req.user = user;

                return next();
            }
            catch (error) {
                logger.error("Fehler bei der Authentifizierung", error);
                req.auth = null;
                req.user = null;
                return  next();
            }
           

           

        };

    }

    // ---------------------------------------------------------
    // Muss authentifiziert sein
    // ---------------------------------------------------------

    requireAuth() {

        return (req, res, next) => {

            if (req.auth && req.auth.authenticated === true && req.auth.user) {
                return next();
            }

                /*if (
                    req.path.startsWith("/api/")
                    ||
                    req.originalUrl.startsWith(
                        "/api/"
                    )
                ) {*/

            return res.status(401).json({

                success: false,
                error: "Authentication required.",
                message: "Anmeldung erforderlich"

            });


        };

    }
    //---------------------------------------------------------- 
    //Web Auth
    //
    //Keine Session -> /login
    //----------------------------------------------------------
    requireWebAuth() {

        return (req, res, next) => {
            //console.log(req);
            if (req.auth && req.auth.authenticated === true && req.user) {
                return next();
            }

            //Login nie selbst umleiten
            if (req.path === "/login" || req.originalUrl.startsWith("/login")) {
                return next();
            }

            const returnUrl = encodeURIComponent(req.originalUrl || "/");
            logger.debug(`Web-Zugriff ohne Authentizifierung: ${req.method} ${req.originalUrl}`);

            return res.redirect(`/login?reason=session-expired&returnUrl=${returnUrl}`); 

        };
    }

    // ---------------------------------------------------------
    // Rolle
    // ---------------------------------------------------------

    requireRole(...requiredRoles) {

        return (req, res, next) => {

            if (!req.auth || req.auth.authenticated !== true ||  !req.auth.user) {

                 return res.status(401).json({

                    success: false,
                    error: "Authentication required.",
                    message: "Anmeldung erforderlich"

                });

            }

            const user = req.auth.user;

            //keine Rollen angegeben
            if (!requiredRoles || requiredRoles.length === 0) {
                return next();
            }

            //Benutzerrollen
            const userRoles = Array.isArray(user.roles) ? user.roles : [];

            //Prüfung
            const allowed = requiredRoles.some(role => userRoles.includes(role));

            if (!allowed) {
                logger.warn(
                    `Zugriff verweigert: Benutzer ${user.username || user.name || "unknown"},
                    Rollen: ${userRoles.join(", ")},
                    benötigt: ${requiredRoles.join(", ")}`
                );

                //API------------------------------------------------------------
                if (req.orginalUrl.startsWith("/api/")) {
                     return res.status(403).json({
                        success: false,
                        error: "FORBIDDEN",
                        message: "Keine ausreichenden Berechtigungen"
                    });
                }

                // Web-----------------------------------------------------------

                return res.status(403).send("Zugriff verweigert.");
            }

            return next();

        };

    }

    // ---------------------------------------------------------
    // Eine von mehreren Rollen
    // ---------------------------------------------------------

    requireAnyRole(roles = []) {

        return (req, res, next) => {

            const user =
                req.auth?.user;

            if (!user) {

                res.status(401).json({ 

                    success: false,

                    error:
                        "Authentication required."

                });

                return;

            }

            const userRoles =
                user.roles || [];

            const allowed =
                roles.some(
                    role =>
                        userRoles.includes(role)
                );

            if (!allowed) {

                res.status(403).json({

                    success: false,

                    error:
                        "Access denied."

                });

                return;

            }

            next();

        };

    }
    //-----------------------------------------------------------
    //Optionale Rollenprüfung
    //-----------------------------------------------------------
    hasRole(user, role) {
        if (!user || !role) {
            return false;
        }

        return (Array.isArray(user.roles) && user.roles.includes(role));
    }
    //-----------------------------------------------------------
    //Cookie löschen
    //-----------------------------------------------------------
    clearCookie(res) {
        if (!res) {
            return;
        }

        res.clearCookie(this.cookieName, {
            httpOnly: true,
            sameSite: "lax"
        });
    }


}

module.exports = AuthMiddleware;