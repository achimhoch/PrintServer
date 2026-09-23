"use strict";

class DiscoveryController {

    constructor(bootstrap) {

        this.bootstrap = bootstrap;

       

    }

    //---------------------------------------------------------- 
    // Alle Drucker
    //---------------------------------------------------------- 

    async list(req, res) {

       
       
        const name = "DruckeScan"
        //res.json(printers);

        res.render("printers/discovery", { name: name,  }); 
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