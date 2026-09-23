"use strict";

const LoginController = require("../controllers/LoginController");

class MainController {

    constructor(bootstrap) {

        this.bootstrap = bootstrap;

        this.login = new LoginController();

        

    }

    //---------------------------------------------------------- 
    // loginpage
    //---------------------------------------------------------- 

    async list(req, res) {

       
        const name = "Login"
        const application = "HWL Print Server"; 
        const version = "1.0.0";
        const status = "running";
           /*res.json({

                    application: "Node Print Server",

                    version: "1.0.0",

                    status: "running"

            })*/

        
        
        res.render("home", { name: name, });

       


    }

    //---------------------------------------------------------- 
    // login
    //----------------------------------------------------------

    async create(req, res) {

         const logIn = await this.login.login(req.body);
    
       /* const { user, passwort, domain } = req.body;
        
        res.status(201).json(req.body);*/

        console.log(logIn.message);

       



       
        //res.render("printers/view_v2", { id: req.params.id, name: printer.name, });  

         

    }

    //----------------------------------------------------------
    // logout
    //----------------------------------------------------------

    async logout(req, res) {

        const printer = await this.manager.create(

            req.body

        );

        res.status(201).json({

            success: true,

            data: printer

        });

    }


}

module.exports = MainController;