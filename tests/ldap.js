const Ldap = require('ldapjs-promise');

async function ldapSearch(username, password) {
    console.log(username);
    const bindUser = username + "@uni-bamberg.de";
    const Client = Ldap.createClient({
        url: "ldaps://rz-ad01-g9.servinfra.uni-bamberg.de:636"
    });

    try {
        const Bind = await Client.bind(bindUser, password);
        if (Bind) {
            console.log("Erfolgreich angemeldet");
        } else {
            console.log("Anmeldung fehlgeschlagen");
        }

        const opts = {
            filter: `(sAMAccountName=${username})`,
            scope: "sub",
            attributes: [
                                "dn",
                                "cn",
                                "displayName",
                                "mail",
                                "sAMAccountName",
                                "userPrincipalName",
                                "memberOf"
                            ]
        };

        const result = await Client.search(`OU=wlv, DC=UNI-BAMBERG, DC=DE`, opts);
        //console.log(result);

        result.on('searchEntry', (entry) => {
            console.log("Benutzer gefunden: " + entry);
        });
    } 
    catch (error) {
        console.log(error);
    }

    Client.unbind();
}

async function LdapSearch(username, password) {
    //console.log(username);
    const bindUser = username + "@uni-bamberg.de";
    const Client = Ldap.createClient({
        url: "ldaps://rz-ad01-g9.servinfra.uni-bamberg.de:636"
    });

    try {
        const Bind = await Client.bind(bindUser, password);
        if (Bind) {
            console.log("Erfolgreich angemeldet");
        } else {
            console.log("Anmeldung fehlgeschlagen");
        }

        const opts = {
            filter: `(sAMAccountName=${username})`,
            scope: "sub",
            attributes: [
                                "dn",
                                "cn",
                                "displayName",
                                "mail",
                                "sAMAccountName",
                                "userPrincipalName",
                                "memberOf"
                            ]
        };

        await Client.search(`OU=wlv, DC=UNI-BAMBERG, DC=DE`, opts, (error, result) => {
        //console.log(result);
            const Entries = [];
            result.on('searchEntry', (entries) => {
               //console.log("Benutzer gefunden: " + entries);
               const entry = JSON.parse(entries);
               //console.log(entry.attributes['values']);
               Object.values(entry.attributes).forEach((attribute) => {
               //console.log(attribute.type);
               const user =  `${attribute.type}: ${attribute.values}`
               

               Entries.push(user);
               //console.log(Entries);
               });

             
               //console.log(Entries.length);
                        
            });
          
           return Entries;   
        });

    } 
    catch (error) {
        console.log(error);
    }
        Client.unbind(); 

}

   



const User = LdapSearch("ba5cg8", "?Abc123@");
User.forEach(user => {console.log(user);});