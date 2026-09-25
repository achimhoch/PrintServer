


"use strict";

const ldap = require('ldapjs-promise');
const config = require("config");

class LdapService {

    constructor(options = {}) {

        this.options = {
            url: options.url ||
                config.get("authentication.ldap.url"),

            baseDN: options.baseDN ||
                config.get("authentication.ldap.baseDN"),

            userSearchBaseDN:
                options.userSearchBaseDN ||
                config.get(
                    "authentication.ldap.userSearch.baseDN"
                ),

            userSearchFilter:
                options.userSearchFilter ||
                config.get(
                    "authentication.ldap.userSearch.filter"
                ),

            bindUsername:
                options.bindUsername ||
                config.get(
                    "authentication.ldap.bind.username"
                ),

            bindPassword:
                options.bindPassword ||
                config.get(
                    "authentication.ldap.bind.password"
                ),

            timeout:
                options.timeout ||
                config.get(
                    "authentication.ldap.timeout"
                ),

            connectTimeout:
                options.connectTimeout ||
                config.get(
                    "authentication.ldap.connectTimeout"
                ),

            tls:
                options.tls || {
                    enabled: config.get(
                        "authentication.ldap.tls.enabled"
                    ),

                    rejectUnauthorized:
                        config.get(
                            "authentication.ldap.tls.rejectUnauthorized"
                        )
                }
        };

        this.client = null;
    }

    // ---------------------------------------------------------
    // LDAP Client
    // ---------------------------------------------------------

    createClient() {

        const url = this.options.url;

        const options = {
            url,
            timeout: this.options.timeout,
            connectTimeout: this.options.connectTimeout
        };

        if (
            url.startsWith("ldaps://") &&
            this.options.tls
        ) {

            options.tlsOptions = {
                rejectUnauthorized:
                    this.options.tls.rejectUnauthorized
            };

        }

        return ldap.createClient(options);
    }

    // ---------------------------------------------------------
    // Bind
    // ---------------------------------------------------------

    bind(client, username, password) {

        return new Promise((resolve, reject) => {

            client.bind(
                username,
                password,
                error => {

                    if (error) {
                        reject(error);
                        return;
                    }

                    resolve();

                }
            );

        });

    }

    // ---------------------------------------------------------
    // Suche
    // ---------------------------------------------------------

    search(client, baseDN, options) {

        return new Promise((resolve, reject) => {

            client.search(
                baseDN,
                options,
                (error, result) => {

                    if (error) {
                        reject(error);
                        return;
                    }

                    const entries = [];

                    result.on(
                        "searchEntry",
                        entry => {

                            entries.push(
                                entry.object
                            );

                        }
                    );

                    result.on(
                        "error",
                        reject
                    );

                    result.on(
                        "end",
                        () => resolve(entries)
                    );

                }
            );

        });

    }

    // ---------------------------------------------------------
    // Benutzer suchen
    // ---------------------------------------------------------

    async findUser(username) {

        if (!username) {
            throw new Error(
                "LDAP username is required."
            );
        }

        const client =
            this.createClient();

        try {

            await this.bind(
                client,
                this.options.bindUsername,
                this.options.bindPassword
            );

            const filter =
                this.options.userSearchFilter
                    .replace(
                        "{{username}}",
                        this.escapeFilter(username)
                    );

            const entries =
                await this.search(
                    client,
                    this.options.userSearchBaseDN,
                    {
                        scope: "sub",
                        filter,

                        attributes: [
                            "dn",
                            "cn",
                            "displayName",
                            "mail",
                            "sAMAccountName",
                            "userPrincipalName",
                            "memberOf"
                        ]
                    }
                );

            if (!entries.length) {
                return null;
            }

            return this.normalizeUser(
                entries[0]
            );

        }
        finally {

            this.close(client);

        }

    }

    // ---------------------------------------------------------
    // Benutzer authentifizieren
    // ---------------------------------------------------------

    async authenticate(username, password) {

        if (!username) {
            throw new Error(
                "LDAP username is required."
            );
        }

        if (!password) {
            throw new Error(
                "LDAP password is required."
            );
        }

        const user =
            await this.findUser(username);

        if (!user) {
            return null;
        }

        const client =
            this.createClient();

        try {

            /*
             * Der Benutzer-DN wird mit dem vom AD
             * gelieferten DN authentifiziert.
             */

            await this.bind(
                client,
                user.dn,
                password
            );

            return user;

        }
        catch (error) {

            /*
             * Keine LDAP-Details an den Client
             * weitergeben.
             */

            return null;

        }
        finally {

            this.close(client);

        }

    }

    // ---------------------------------------------------------
    // Gruppen
    // ---------------------------------------------------------

    async getGroups(user) {

        if (!user || !user.dn) {
            return [];
        }

        /*
         * Bei AD liefert memberOf die direkten Gruppen.
         */

        return Array.isArray(user.memberOf)
            ? user.memberOf
            : user.memberOf
                ? [user.memberOf]
                : [];
    }

    // ---------------------------------------------------------
    // Normalisieren
    // ---------------------------------------------------------

    normalizeUser(entry) {

        return {

            dn:
                entry.dn ||
                entry.distinguishedName ||
                "",

            username:
                entry.sAMAccountName ||
                entry.userPrincipalName ||
                "",

            userPrincipalName:
                entry.userPrincipalName ||
                "",

            name:
                entry.displayName ||
                entry.cn ||
                "",

            email:
                entry.mail ||
                "",

            groups:
                Array.isArray(entry.memberOf)
                    ? entry.memberOf
                    : entry.memberOf
                        ? [entry.memberOf]
                        : []

        };

    }

    // ---------------------------------------------------------
    // LDAP Filter Escaping
    // ---------------------------------------------------------

    escapeFilter(value) {

        return String(value)
            .replace(/\\/g, "\\5c")
            .replace(/\*/g, "\\2a")
            .replace(/\(/g, "\\28")
            .replace(/\)/g, "\\29")
            .replace(/\0/g, "\\00");

    }

    // ---------------------------------------------------------
    // Verbindung schließen
    // ---------------------------------------------------------

    close(client) {

        if (!client) {
            return;
        }

        try {
            client.unbind();
        }
        catch (error) {
            // Verbindung bereits geschlossen.
        }

    }

}

module.exports = LdapService;








