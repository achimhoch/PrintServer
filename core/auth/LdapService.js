


"use strict";

const Ldap = require('ldapjs-promise');
const config = require("config");
const logger = require("../logging/LogManager").getLogger("LdapService");

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
        /*this.client = Ldap.createClient({
            url: "ldaps://rz-ad01-g9.servinfra.uni-bamberg.de:636"
        });
        this.client.on('error', (err) => {
            logger.error("LdapClient: " + err);
        });*/
    }

    // ---------------------------------------------------------
    // LDAP Client
    // --------------------------------------------------------- 

    createClient() {

        const url = this.options.url;
        //console.log(url);
        /*const options = {
            url,
            timeout: this.options.timeout,
            connectTimeout: this.options.connectTimeout
        };

        /*if (
            url.startsWith("ldaps://") &&
            this.options.tls
        ) {

            options.tlsOptions = {
                rejectUnauthorized:
                    this.options.tls.rejectUnauthorized
            };

        }*/
        const options = {url};

        return Ldap.createClient(options);

       
    }

    // ---------------------------------------------------------
    // Bind
    // ---------------------------------------------------------

    bind(client, username, password) {
        //console.log(client + ', ' + username + ', '+ password);
      

        return new Promise((resolve, reject) => {

            client.bind(
                username,
                password,
                error => {

                    if (error) {
                        console.log(error);
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

    async ldapSearch(client, username, password) {
            //console.log(username);
            //console.log(client);
            const bindUser = username + "@uni-bamberg.de";
            /*const Client = Ldap.createClient({
                url: "ldaps://rz-ad01-g9.servinfra.uni-bamberg.de:636"
            });*/
        
            try {
                const Bind = await this.bind(client, bindUser, password);
                if (Bind) {
                    logger.info("Erfolgreich am Ldap angemeldet");
                } else {
                    logger.error("Anmeldung fehlgeschlagen");
                }
        
                const opts = {
                    filter: `(sAMAccountName=${username})`,
                    scope: "sub",
                    attributes: [
                                        "distinguishedName",
                                        "cn",
                                        "displayName",
                                        "mail",
                                        "sAMAccountName",
                                        "userPrincipalName",
                                        "memberOf"
                                    ]
                };
                return new Promise((resolve, reject) => {
                    client.search(`OU=wlv, DC=UNI-BAMBERG, DC=DE`, opts, (error, result) => {
                    //console.log(result);

                        const entries = [];
                
                        result.on('searchEntry', (entry) => {
                            //console.log("Benutzer gefunden: " + entry);
                            entries.push(entry);
                        });

                        //console.log(entries);

                        result.on('error', reject);

                        result.on('end', () => {
                            resolve(entries);
                        });
                    });
                });
            } 
            catch (error) {
                logger.error("Ldapsearch: " + error);
            }
       
    }
    /*search(baseDN, options) {

       

        return new Promise((resolve, reject) => {

            this.client.search(
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
        
    }*/


    // ---------------------------------------------------------
    // Benutzer suchen
    // ---------------------------------------------------------

    async findUser(username, password) {

        if (!username) {
            throw new Error(
                "LDAP username is required."
            );
        }
        //console.log(this.options.bindUsername);
        const client = this.createClient();
        //console.log(client);

        try {
               
            const search = await this.ldapSearch(client, username, password);
            //console.log("Entires: " + search);
            if (!search.length) {
                return null;
            }
            const entries = [];
            const Entry = JSON.parse(search);
            //console.log(Entry);
            Object.values(Entry.attributes).forEach(attr => {
                //console.log(attr.values.length);
               
                entries.push(attr.values);
                //console.log(entries);
            });

            //console.log(entries);

           

            return this.normalizeUser(
                entries
            );

        } 
        catch (error) {
           logger.error("finduser: " + error); 
        }
        finally {

            this.close(client);
            
        }

    }

    // ---------------------------------------------------------
    // Benutzer authentifizieren
    // ---------------------------------------------------------

    async authenticate(username, password) {
        //console.log(username + ', ' + password);
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

        const user = await this.findUser(username, password);
        //console.log(user.dn);
        if (!user) {
            logger.error(`Der Benutzer ${username} ist nicht vorhanden`);
            return null;
        }

        const client = this.createClient();
             //logger.info("LdapClient erstellt");

        try {

            /*
             * Der Benutzer-DN wird mit dem vom AD
             * gelieferten DN authentifiziert.
             */

            const result = await this.bind( 
                client, 
                user.dn,
                password
            );

            //console.log(result);

            return user;

        }
        catch (error) {
            logger.error("autenticate: " + error);
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
        //console.log(entry[3]);
        return {

            dn:
                entry.dn ||
                entry.distinguishedName ||
                entry[1][0] ||
                "",

            username:
                entry.sAMAccountName ||
                entry.userPrincipalName ||
                entry[4][0]  ||
                "",

            userPrincipalName:
                entry.userPrincipalName ||
                entry[5][0]  ||
                "",

            name:
                entry.displayName ||
                entry.cn ||
                 entry[5][0]  ||
                "",

            email:
                entry.mail ||
                 entry[6][0]  ||
                "",

            groups:
                Array.isArray(entry.memberOf)
                    ? entry.memberOf
                    : entry.memberOf
                        ? [entry.memberOf]
                        : []
                            ? entry[3]
                            :[]

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
            logger.info("Der Ldap-Client ist bereits geschlossen");
            return;
            
        }

        try {
            client.unbind();
            logger.info("Der Ldapclient wurde geschlossen");
        }
        catch (error) {
            // Verbindung bereits geschlossen.
            logger.error(error);
        }

    }

}

module.exports = LdapService;








