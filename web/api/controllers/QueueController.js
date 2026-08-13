"use strict";

class QueueController {

    constructor(bootstrap) {

        this.bootstrap = bootstrap;

        this.manager = bootstrap.queueManager;  

        this.socket = this.bootstrap.socket

    }

    //---------------------------------------------------------- 
    // Alle Queues
    //----------------------------------------------------------

    async list(req, res, next) {

        try {

            const queues = await this.manager.All();      

            res.json({

                success: true,

                printers

            });

             //res.json(queues);
        }
        catch (err) {
            next(err);
        }

           

       


    }

    //----------------------------------------------------------
    // Queues nach ID
    //----------------------------------------------------------

    async get(req, res, next) {

        try {

            const queue = await this.manager.get(req.params.id);

            if (!queue) {

                return res.status(404).json({

                    success: false,

                    error: {
                        code: "QUEUE_NOT_FOUND",

                        message: "Printer not found"
                    }

                });


            }

            res.json({
                success: true,

                data: queue
            });
        }

        catch (err) {
            next(err);
        }

        //res.render("printers/view", { printer: printer, });  

    }

    //----------------------------------------------------------
    // Queues anlegen
    //----------------------------------------------------------

    async create(req, res, next) {

        try {
            const queue = await this.manager.create(req.body);

            res.status(201).json({

                success: true,

                data: printer

            });
        }
        catch (err) {
            next(err);
        }

    }

    //----------------------------------------------------------
    // Queues ändern
    //----------------------------------------------------------

    async update(req, res) {

        try {

            const queue = await this.manager.update(req.params.id, req.body);

            if (!queue) {

                return res.status(404).json({

                    success: false,
                    error: {
                    code: "QUEUE_NOT_FOUND",
                    message: "Printer not found"
                    }

                });

            }

            res.json({

                success: true,

                data: queue

            });
        }
        catch (err) {
            next(err);
        }

    }

    //----------------------------------------------------------
    // Queues löschen
    //----------------------------------------------------------

    async remove(req, res, next) {
        
        try {

            const result = await this.manager.remove(req.params.id0);

            if (!result) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: "QUEUE_NOT_FOUND",
                        message: "Queue not found."
                    }
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
    //Status
    //

    async status(res, req, next) {
        try {
            const queue = await this.queueManager.get(req.params.id);

            if(!queue) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: "QUEUE_NOT_FOUND",
                        message: "Queue not found."
                    }
                });
            }

            res.json({
                success: true,
                data: {
                    id: queue.id,
                    name: queue.name,
                    paused: queue.paused,
                    processing: queue.processing,
                    activeJobId: queue.activeJobId,
                    jobCount: queue.jobCount
                }
            });
        }
        catch (err) {
            next(err);
        }
    } 

    //----------------------------------------------------------
    // Queue Pause
    //----------------------------------------------------------

    async pause(req, res, next) {

        try {

            const queue = await this.manager.pause(req.params.id);

            if(!queue) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: "QUEUE_NOT_FOUND",
                        message: "Queue not found."
                    }
                });

            }

            res.json({

                success: true,

                data: queue

            });
        } 
        catch (err) {
            next(err);
        }  

    }

    //----------------------------------------------------------
    // Queue fortsetzen
    //----------------------------------------------------------

    async resume(req, res, next) {

        try {

            const queue = await this.manager.resume();

            if(!queue) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: "QUEUE_NOT_FOUND",
                        message: "Queue not found"
                    }
                });
            }

            res.json({

                success: true,

                data: queue

            });
        }
        catch (err) {
            next(err);
        }

    }

   

    //----------------------------------------------------------
    // Queue aktivieren
    //----------------------------------------------------------

    async enable(req, res, next) {

        try {

            const queue = await this.manager.enable(req.params.id);

            if(!queue) {
               return res.status(404).json({
                    success: false,
                    error: {
                        code: "QUEUE_NOT_FOUND",
                        maessage: "Queue not found."
                    }
               });

            }

            res.json({

                success: true,

                data: queue

            });

        }
        catch (err) {
            next(err);
        }

    }

    //----------------------------------------------------------
    // Queue deaktivieren
    //----------------------------------------------------------

    async disable(req, res, next) {

        try {

            const queue = await this.manager.disable(req.params.id);

            if(!queue) {
               return res.status(404).json({
                    success: false,
                    error: {
                        code: "QUEUE_NOT_FOUND",
                        maessage: "Queue not found."
                    }
               });

            }


            res.json({

                success: true,

                data: queue

            });
        }
        catch (err) {
            next(err);
        }

    }

    //----------------------------------------------------------
    // jobs in Queue
    //----------------------------------------------------------

    async findByQueue(req, res) {

        await this.manager.findByQueue(req.params.id);

        res.json({

            success: true,

            message: "Test page sent"

        });

    }

    async findJob(req, res) {

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

    async statistics(req, res) {

        const stats = await this.manager.statistics();

        res.json({

            success: true,

            data: stats

        });

    }

}

module.exports = QueueController;