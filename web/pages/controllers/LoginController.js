"use strict";

const Ldap = require('ldapjs-promise');
const logger = require("../../../core/logging/LogManager").getLogger("LoginController"); 

class LoginController {

    constructor(bootstrap) {

        this.bootstrap = bootstrap;

    }

    

    //---------------------------------------------------------- 
    // Alle Drucker
    //---------------------------------------------------------- 

    async login(logdata) {
        

        //console.log(logdata.user + '@' + logdata.domain);
        const Client = Ldap.createClient({
            url: 'ldaps://rz-ad01-g9.servinfra.uni-bamberg.de:636',
            tlsOptions: { rejectUnauthorized: true }
        });

        Client.on('error', (err) => {
           logger.error(err); 
        });

        //const bindDN = `CN=${logdata.user},DC=${logdata.domain},DC=de`; 
        const bindDN = `${logdata.user}@${logdata.domain}`;
        //const bindDN = `ba5cg8@uni-bamberg.de`; 
        const bindPassword = `${logdata.passwort}`;
        //const bindPassword = `$Abc123@`;

        Client.bind(bindDN, bindPassword, (err) => {
            if (err) {
                logger.error("Authentizierungsfehler: " + err.message);
                Client.destroy();
                let message = "false";
                return {message};
                
            }

            this.searchUser(Client, logdata);
            logger.info("Authentifizierung erfolgreich " + logdata.user);
            let message = "ok";
            return {message};

            
        });
        
        
       


    }


    //----------------------------------------------------------
    //logout
    //----------------------------------------------------------

    async logout() {

    }

    //----------------------------------------------------------
    //User
    //----------------------------------------------------------

    searchUser(client, logdata) {
        const opts = {
            filter: `(cn=${logdata.user})`, // Suchfilter (z.B. nach Benutzername)
            scope: 'sub',             // Durchsucht den aktuellen Baum und alle Unterbäume
            attributes: ['dn', 'cn', 'mail'] // Attribute, die zurückgegeben werden sollen
        };

        const baseDN = 'OU=wlv,DC=UNI-BAMBERG.DE,DC=DE';

        client.search(baseDN, (err, res) => {
            if (err) {
            console.error('Fehler bei der Suche:', err.message);
            return;
            }

            // Event-Handler für gefundene Einträge
            res.on('searchEntry', (entry) => {
            console.log('Eintrag gefunden:', entry.pojo); 
            // Alternativ: entry.status für rohe Daten
            });

            // Event-Handler für Fehler während der Suche
            res.on('searchReference', (referral) => {
            console.log('Referral:', referral.uris.join());
            });

            res.on('error', (err) => {
            console.error('Fehler im Such-Stream:', err.message);
            });

            // Event-Handler, wenn die Suche abgeschlossen ist
            res.on('end', (result) => {
            console.log('Suche beendet. Status:', result.status);
            
                // Wichtig: Verbindung nach getaner Arbeit schließen
                client.unbind((err) => {
                    if (err) console.error(err.message);
                    client.destroy();
                });
            });
        });
    }

   

    //----------------------------------------------------------
    // Testseite drucken
    //----------------------------------------------------------

    async test(req, res) {

      

        res.json({

            success: true,

            message: "Test"

        });

    }

}

module.exports = LoginController;