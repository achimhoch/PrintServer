"use strict";

class AppController {

    constructor(bootstrap) {

        this.bootstrap = bootstrap;

        this.printManager = bootstrap.printerManager; 
        this.queueMananger = bootstrap.queueManager; 

        this.socket = this.bootstrap.socket

    }

    //---------------------------------------------------------- 
    // Alle Drucker
    //---------------------------------------------------------- 

    async printers(req, res) {

        const printers = await this.printManager.All();     

        /*res.json({

            success: true,

            printers

        });*/
        console.log(printers);
        res.json(printers);

       


    }

    //----------------------------------------------------------
    // Drucker nach ID
    //----------------------------------------------------------

    async getPrinter(req, res) {

        const printer = await this.printManager.View(

            req.params.id

        );

        if (!printer) {

            return res.status(404).json({

                success: false,

                message: "Printer not found"

            });


        }
        //console.log(printer);
        res.json(printer);

        //res.render("printers/view", { printer: printer, });  

    }

     async queues(req, res) {

        const queues = await this.queueMananger.All();     

        /*res.json({

            success: true,

            printers

        });*/
        console.log(queues);
        res.json(queues);

       


    }

    //----------------------------------------------------------
    // Drucker nach ID
    //----------------------------------------------------------

    async getQueue(req, res) {

        const queue = await this.queueMananger.View(

            req.params.id

        );

        if (!queue) {

            return res.status(404).json({

                success: false,

                message: "Printer not found"

            });


        }
        //console.log(printer);
        res.json(queue);

        //res.render("printers/view", { printer: printer, });  

    }



    

}

module.exports = AppController;