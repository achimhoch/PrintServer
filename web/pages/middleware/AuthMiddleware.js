"use strict";

const config =
    require("config");

class AuthMiddleware {

    constructor(authService) {

        this.authService =
            authService;

    }

    // ---------------------------------------------------------
    // Session lesen
    // ---------------------------------------------------------

    authenticate() {

        return (req, res, next) => {

            const cookieName =
                config.get(
                    "authentication.session.cookieName"
                );

            const sessionId =
                req.cookies?.[cookieName];

            const session =
                this.authService.getSession(
                    sessionId
                );

            if (session) {

                req.auth = {

                    authenticated: true,

                    sessionId:
                        session.id,

                    user:
                        session.user

                };

            }
            else {

                req.auth = {

                    authenticated: false,

                    sessionId: null,

                    user: null

                };

            }

            next();

        };

    }

    // ---------------------------------------------------------
    // Muss authentifiziert sein
    // ---------------------------------------------------------

    requireAuth() {

        return (req, res, next) => {

            if (
                !req.auth ||
                !req.auth.authenticated
            ) {

                if (
                    req.path.startsWith("/api/")
                    ||
                    req.originalUrl.startsWith(
                        "/api/"
                    )
                ) {

                    res.status(401).json({

                        success: false,

                        error:
                            "Authentication required."

                    });

                    return;

                }

                res.redirect(
                    "/login"
                );

                return;

            }

            next();

        };

    }

    // ---------------------------------------------------------
    // Rolle
    // ---------------------------------------------------------

    requireRole(role) {

        return (req, res, next) => {

            if (
                !req.auth ||
                !req.auth.user
            ) {

                res.status(401).json({

                    success: false,

                    error:
                        "Authentication required."

                });

                return;

            }

            const roles =
                req.auth.user.roles || [];

            if (!roles.includes(role)) {

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

}

module.exports = AuthMiddleware;