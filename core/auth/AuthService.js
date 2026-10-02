"use strict";

const config = require("config");
const LdapService = require("./LdapService");
const SessionManager = require("./SessionManager");
const logger = require("../logging/LogManager").getLogger("AuthService"); 



class AuthService {

    constructor(options = {}) {

        this.ldap =
            options.ldap ||
            new LdapService();

        this.sessions =
            options.sessions ||
            new SessionManager({

                duration:
                    config.get(
                        "authentication.session.duration"
                    ),

                cookieName:
                    config.get(
                        "authentication.session.cookieName"
                    )

            });

        this.roles =
            config.get(
                "authentication.roles"
            );

    }

    // ---------------------------------------------------------
    // Login
    // ---------------------------------------------------------

    async login(username, password) {
        //console.log(username);
        const user = await this.ldap.authenticate(username, password);
        //console.log(user);
        if (!user) {
            logger.error("Benutzer nicht gefunden");
            return null;
        }

        //user.groups = await this.ldap.getGroups(user);

        user.roles = this.resolveRoles(user.groups);

        //console.log(user.roles);
        //console.log(user);
        return this.sessions.create(
            user
        );

    }

    // ---------------------------------------------------------
    // Logout
    // ---------------------------------------------------------

    logout(sessionId) {

        return this.sessions.destroy(  
            sessionId
        );

    }

    // ---------------------------------------------------------
    // Session
    // ---------------------------------------------------------

    getSession(sessionId) {

        return this.sessions.get(
            sessionId
        );

    }

    getUser(sessionId) {

        return this.sessions.getUser(
            sessionId
        );

    }

    // ---------------------------------------------------------
    // Rollen
    // ---------------------------------------------------------

    resolveRoles(groups = []) {
        //console.log(groups);
        const roles = [];

        const normalized =
            groups.map(
                group =>
                    String(group)
                        .toLowerCase()
            );
        //console.log(normalized);
        for (const [role, roleConfig] of Object.entries(this.roles) ) {

            const configuredGroups = Array.isArray(roleConfig.groups) ? roleConfig.groups : [];

            const matches =
                configuredGroups.some(
                    group =>
                        normalized.includes(
                            String(group)
                                .toLowerCase()
                        )
                );
            //console.log(matches);
            if (matches) {
                roles.push(role);
            }

        }

        /*
         * Jeder authentifizierte AD-Benutzer
         * bekommt mindestens "user".
         */

        if (!roles.includes("user")) {
            roles.push("user");
        }
        //console.log(roles);
        return roles;

    }

    // ---------------------------------------------------------
    // Rollenprüfung
    // ---------------------------------------------------------

    hasRole(user, role) {

        if (!user) {
            return false;
        }

        return Array.isArray(user.roles)
            && user.roles.includes(role);

    }

    hasAnyRole(user, roles = []) {

        return roles.some(
            role =>
                this.hasRole(user, role)
        );

    }

}

module.exports = AuthService;