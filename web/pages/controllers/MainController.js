"use strict"

const logger = require("../../../core/logging/LogManager").getLogger("Maincontroller");

class MainController {

    constructor(bootstrap) { 
        this.bootstrap = bootstrap; 
        this.authService = bootstrap.authService; 
    } 

    //---------------------------------------------------------
    //home
    //

    async Main(req, res) {
        //console.log(req.auth.user);
        const authuser = req.auth.user.username;

        if (req.auth.user.roles[0] === "admin") {
            res.render("home", { authUser: authuser, pages: "admin", name: "Admin", });
        } else {

            res.render("home", { authUser: authuser, pages: "", name: "Home", });
        }
    }
    
    // --------------------------------------------------------- 
    // Login-Seite 
    // --------------------------------------------------------- 
    async loginPage(req, res) { 
        if (req.auth && req.auth.user) { 
            res.redirect("/"); 
            return; 
        } 
        
        res.render( "login/login", { pages: "login", title: "Login", error: null, name: "Login" } );  
    } 

    // --------------------------------------------------------- 
    // Login API 
    // --------------------------------------------------------- 
    async login(req, res) { 
        try { 
            const { username, password } = req.body || {}; 
            if (!username || !password) { 
                res.status(400).json({ 
                    success: false, 
                    error: "Benutzername und Passwort sind erforderlich." 
                }); 
                return; 
            } 
            
            const session = await this.authService.login( username, password ); 
            //console.log(session);
            if (!session) { 
                res.status(401).json({ 
                    success: false, 
                    error: "Benutzername oder Passwort ist ungültig." 
                }); 
                
                return; 
            } 
            
            this.setCookie( res, session.id ); 

            res.json({ 
                success: true, 
                user: session.user 
            }); 
        } 
        catch (error) { 
            req.log?.error?.( error ); 
            logger.error(error);
            res.status(500).json({ 
                success: false, 
                error: "Anmeldung konnte nicht durchgeführt werden." 
            }); 
        } 
    } 
    // --------------------------------------------------------- 
    // Logout 
    // --------------------------------------------------------- 
    async logout(req, res) { 

        /*const sessionId = req.cookies[this.authService.sessionManager.cookieName];

         if (sessionId) { 
            this.authService.logout( sessionId ); 
         }
            res.clearCookie( 
                this.authService.sessionManager.cookieName,
                this.authService.sessionManager.cookie 
            ); 

            return res.json({success: true});*/
        
        
        const sessionId = req.auth?.sessionId; 
        //console.log(sessionId);
        if (sessionId) { 
           const Delete = this.authService.logout(sessionId); 
        }
        
        if (Delete) {
            res.redirect("http://141.13.14.121:3000/");
        }
        
        res.clearCookie( this.getCookieName() ); 
        
        res.json({ success: true }); 
    } 
    // --------------------------------------------------------- 
    // Aktueller Benutzer
    // --------------------------------------------------------- 
    async me(req, res) { 
        
        if (!req.auth?.user) { 
            
            res.status(401).json({ authenticated: false }); 
            
            return;
        } 
        
        res.json({ 
            authenticated: true, 
            user: req.auth.user 
        }); 
    } 
    // --------------------------------------------------------- 
    // Cookie 
    // --------------------------------------------------------- 
    setCookie(res, sessionId) { 
        
        const config = require("config"); 
        const cookie = config.get( "authentication.session.cookie" ); 
        
        res.cookie( this.getCookieName(), sessionId, cookie ); 
    } 
    
    getCookieName() { 
        
        const config = require("config"); 
        
        return config.get( "authentication.session.cookieName" ); 
    
    } 

    LogOut(req, res) {
        res.send("ok");
    }
} 

module.exports = MainController;
