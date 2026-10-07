"use strict";

class DiscoveryController {

    constructor(bootstrap) {

        this.bootstrap = bootstrap;

       

    }

    //---------------------------------------------------------- 
    // Alle Drucker
    //---------------------------------------------------------- 

    async list(req, res) {

       
        const authuser = req.auth.user.username;
        const name = "Admin : DruckerScan";
        const page = "admin";
        //res.json(printers);

        res.render("admin/discovery", { authUser: authuser, pages: page, name: name,  });  
        //res.render("printers/index_v2", { name: name, });

       


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

module.exports = DiscoveryController;