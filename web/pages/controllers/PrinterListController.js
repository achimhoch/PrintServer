"use strict";

class PrinterListController {

    constructor(bootstrap) {

        this.bootstrap = bootstrap;

        this.manager = bootstrap.printerManager; 

        this.socket = this.bootstrap.socket
        this.filteredPrinters = [];
        this.pageSize = 25;

    }

    //---------------------------------------------------------- 
    // Alle Drucker
    //----------------------------------------------------------  

    async list(req, res) {

        const printers = await this.manager.All(); 
        const page = "admin"; 
        const pageSize = 25;
        const name = "Admin : Drucker"
        if (!req.auth.user.username) {
            res.redirect("7");
        }
        
        const authuser = req.auth.user.username;
        
        //res.json(printers);

        //res.render("printers/index", { printers: printers, socket: this.socket, page: page, pageSize: pageSize,  }); 
        res.render("admin/index_v2", { pages: page, authUser:authuser, name: name, }); 

       


    }

    //----------------------------------------------------------
    // Drucker nach ID
    //----------------------------------------------------------

    async get(req, res) {
        const page = "admin";

        const printer = await this.manager.View(req.params.id);

        if (!printer) {

            return res.status(404).json({

                success: false,

                message: "Printer not found"

            });


        }

       // res.send(req.params.id);

        res.render("admin/view_v2", { pages: page, id: req.params.id, name: printer.name, });  

         

    }

    //----------------------------------------------------------
    // Drucker anlegen
    //----------------------------------------------------------

    async create(req, res) {

        const printer = await this.manager.create(

            req.body

        );

        res.status(201).json({

            success: true,

            data: printer

        });

    }

    //----------------------------------------------------------
    // Drucker ändern
    //----------------------------------------------------------

    async update(req, res) {

        const printer = await this.manager.update(

            req.params.id,

            req.body

        );

        if (!printer) {

            return res.status(404).json({

                success: false,

                message: "Printer not found"

            });

        }

        res.json({

            success: true,

            data: printer

        });

    }

    //----------------------------------------------------------
    // Drucker löschen
    //----------------------------------------------------------

    async remove(req, res) {

        await this.manager.remove(

            req.params.id

        );

        res.json({

            success: true

        });

    }

    //----------------------------------------------------------
    // Online-Drucker
    //----------------------------------------------------------

    async online(req, res) {

        const printers = await this.manager.findOnline();

        res.json({

            success: true,

            data: printers

        });

    }

    //----------------------------------------------------------
    // Offline-Drucker
    //----------------------------------------------------------

    async offline(req, res) {

        const printers = await this.manager.findOffline();

        res.json({

            success: true,

            data: printers

        });

    }

    //----------------------------------------------------------
    // Druckerstatistik
    //----------------------------------------------------------

    async stats(req, res) {

        const stats = await this.manager.statistics();

        res.json({

            success: true,

            data: stats

        });

    }

    //----------------------------------------------------------
    // Drucker aktivieren
    //----------------------------------------------------------

    async enable(req, res) {

        const printer = await this.manager.enable(

            req.params.id

        );

        res.json({

            success: true,

            data: printer

        });

    }

    //----------------------------------------------------------
    // Drucker deaktivieren
    //----------------------------------------------------------

    async disable(req, res) {

        const printer = await this.manager.disable(

            req.params.id

        );

        res.json({

            success: true,

            data: printer

        });

    }

    //----------------------------------------------------------
    // Testseite drucken
    //----------------------------------------------------------

    async test(req, res) {

        await this.manager.printTestPage(

            req.params.id

        );

        res.json({

            success: true,

            message: "Test page sent"

        });

    }

}

module.exports = PrinterListController;