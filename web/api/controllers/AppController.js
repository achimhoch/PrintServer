"use strict";

class AppController {

    constructor(bootstrap) {

        this.bootstrap = bootstrap;

        this.printManager = bootstrap.printerManager;  
        this.queueMananger = bootstrap.queueManager; 
        this.jobManager = bootstrap.jobManager;

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
        //console.log(printers);
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

                message: "Queue not found"

            });


        }
        //console.log(printer);
        res.json(queue);

        //res.render("printers/view", { printer: printer, });  

    }

    async jobs(req, res) {
        const jobs = await this.jobManager.All();

        res.json(jobs);
    }

    async getJob(req, res) {
        const job = await this.jobMananger.View(

            req.params.id

        );

        if (!job) {

            return res.status(404).json({

                success: false,

                message: "Job not found"

            });


        }
        //console.log(printer);
        res.json(job);
    }



    

}

module.exports = AppController;