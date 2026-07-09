"use strict";

const express = require("express");

module.exports = bootstrap => {

    const router = express.Router();

    const manager = bootstrap.printerManager;

    //----------------------------------------------------------
    // Alle Drucker
    //----------------------------------------------------------

    router.get("/", async (req, res, next) => {

        try {

            const printers = await manager.all();

            res.json(printers);

        }
        catch (err) {

            next(err);

        }

    });

    //----------------------------------------------------------
    // Statistik
    //----------------------------------------------------------

    router.get("/stats", async (req, res, next) => {

        try {

            res.json(

                await manager.stats()

            );

        }
        catch (err) {

            next(err);

        }

    });

    //----------------------------------------------------------
    // Online
    //----------------------------------------------------------

    router.get("/online", async (req, res, next) => {

        try {

            res.json(

                await manager.findOnline()

            );

        }
        catch (err) {

            next(err);

        }

    });

    //----------------------------------------------------------
    // Offline
    //----------------------------------------------------------

    router.get("/offline", async (req, res, next) => {

        try {

            res.json(

                await manager.findOffline()

            );

        }
        catch (err) {

            next(err);

        }

    });

    //----------------------------------------------------------
    // Nach ID
    //----------------------------------------------------------

    router.get("/:id", async (req, res, next) => {

        try {

            const printer = await manager.get(

                req.params.id

            );

            if (!printer) {

                return res.status(404).json({

                    error: "Printer not found"

                });

            }

            res.json(printer);

        }
        catch (err) {

            next(err);

        }

    });

    //----------------------------------------------------------
    // Aktualisieren
    //----------------------------------------------------------

    router.put("/:id", async (req, res, next) => {

        try {

            const printer = await manager.update(

                req.params.id,

                req.body

            );

            if (!printer) {

                return res.status(404).json({

                    error: "Printer not found"

                });

            }

            res.json(printer);

        }
        catch (err) {

            next(err);

        }

    });

    //----------------------------------------------------------
    // Status ändern
    //----------------------------------------------------------

    router.patch("/:id/status", async (req, res, next) => {

        try {

            const printer = await manager.setStatus(

                req.params.id,

                req.body.status

            );

            if (!printer) {

                return res.status(404).json({

                    error: "Printer not found"

                });

            }

            res.json(printer);

        }
        catch (err) {

            next(err);

        }

    });

    //----------------------------------------------------------
    // Refresh
    //----------------------------------------------------------

    router.post("/:id/refresh", async (req, res, next) => {

        try {

            const printer = await manager.refresh(

                req.params.id

            );

            if (!printer) {

                return res.status(404).json({

                    error: "Printer not found"

                });

            }

            res.json(printer);

        }
        catch (err) {

            next(err);

        }

    });

    //----------------------------------------------------------
    // Löschen
    //----------------------------------------------------------

    router.delete("/:id", async (req, res, next) => {

        try {

            const ok = await manager.remove(

                req.params.id

            );

            if (!ok) {

                return res.status(404).json({

                    error: "Printer not found"

                });

            }

            res.sendStatus(204);

        }
        catch (err) {

            next(err);

        }

    });

    return router;

};