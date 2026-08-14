"use strict";

class JobController {

    constructor(bootstrap) {

        this.bootstrap = bootstrap;

        this.manager = bootstrap.jobManager; 

        this.socket = this.bootstrap.socket

    }

    //---------------------------------------------------------- 
    // Alle Jobs
    //----------------------------------------------------------

    async list(req, res, next) {

        try {

            const jobs = await this.manager.All();     

            res.json({

                success: true,

                data: jobs

            });

            //res.json(printers);
        }
        catch (err) {
            next(err);
        }

       


    }

    //----------------------------------------------------------
    // Job nach ID
    //----------------------------------------------------------

    async get(req, res, next) {

        try {

            const job = await this.manager.get( req.params.id);

            if (!job) {

                return res.status(404).json({

                    success: false,

                    message: "Job not found"

                });


            }

            res.json({
                success: true,
                data: job
            });

            //res.render("printers/view", { printer: printer, }); 
        }
        catch (err) {
            next(err);
        } 

    }

    //----------------------------------------------------------
    // Job anlegen
    //----------------------------------------------------------

    async create(req, res, next) {

        try {

            const job = await this.manager.create(req.body);

            res.status(201).json({

                success: true,

                data: job

            });
        }
        catch (err) {
            next(err);
        }

    }

    //----------------------------------------------------------
    // Job ändern
    //----------------------------------------------------------

    async update(req, res, next) {

        try {

            const job = await this.manager.update(req.params.id, req.body);

            if (!job) {

                return res.status(404).json({

                    success: false,

                    message: "Job not found"

                });

            }

            res.json({

                success: true,

                data: job

            });

        }
        catch (err) {
            next(err);
        }

    }

    //----------------------------------------------------------
    // Job löschen
    //----------------------------------------------------------

    async remove(req, res, next) {

        try {

            const result = await this.manager.remove(req.params.id);

            if (!job) {

                return res.status(404).json({

                    success: false,

                    message: "Job not found"

                });

            }

            res.json({

                success: true,
                data: true
            });

        }
        catch (err) {
            next(err);
        }

    }

    //----------------------------------------------------------
    // Queue aktivieren
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
    // jobs der Queue
    //----------------------------------------------------------

    async findByQueue(req, res, next) {

        const printers = await this.manager.findByQueue(req.params.id);

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

}

module.exports = JobController;