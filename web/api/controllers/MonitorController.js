"use strict";

class MonitorController {

    constructor(bootstrap) {

        if (!bootstrap)
            throw new Error(
                "MonitorController: bootstrap is required."
            );

        this.bootstrap = bootstrap;

        this.monitor = bootstrap.monitor;

        this.printerManager = bootstrap.printerManager;

    }

    //----------------------------------------------------------
    // Monitor-Status
    //----------------------------------------------------------

    async status(req, res) {

        const stats =
            this.monitor.stats();

        res.json({

            success: true,

            data: stats

        });

    }

    //----------------------------------------------------------
    // Monitor starten
    //----------------------------------------------------------

    async start(req, res) {

        this.monitor.start();

        res.json({

            success: true,

            data: this.monitor.stats()

        });

    }

    //----------------------------------------------------------
    // Monitor stoppen
    //----------------------------------------------------------

    async stop(req, res) {

        this.monitor.stop();

        res.json({

            success: true,

            data: this.monitor.stats()

        });

    }

    //----------------------------------------------------------
    // Manuellen Monitor-Zyklus ausführen
    //----------------------------------------------------------

    async tick(req, res) {

        await this.monitor.tick();

        res.json({

            success: true,

            data: this.monitor.stats()

        });

    }

    //----------------------------------------------------------
    // Druckerstatus
    //----------------------------------------------------------

    async printers(req, res) {

        const printers = await this.printerManager.All();

        res.json({

            success: true,

            data: printers.map(printer => ({

                id: printer.id,

                name: printer.name,

                ip: printer.ip,

                uri: printer.uri,

                status:
                    printer.status ||
                    "UNKNOWN",

                online:
                    printer.online !== false,

                lastSeen:
                    printer.lastSeen ||
                    null,

                lastUpdate:
                    printer.lastUpdate ||
                    null,

                driver:
                    printer.driver
                        ? printer.driver.constructor.name 
                        : null

            }))

        });

    }

    //----------------------------------------------------------
    // Gesamtstatus
    //----------------------------------------------------------

    async overview(req, res) {

        const printers = await this.printerManager.All(); 
        //console.log(printers);
        let online = 0;
        let offline = 0;
        let printing = 0;
        let errors = 0;

        for (const printer of printers) {
        //printers.forEach(printer => {
            
            const status =
                String(
                    printer.status || ""
                ).toUpperCase();

            if (
                status === "ONLINE" ||
                status === "IDLE"
            ) {

                online++;

            }
            else if (
                status === "PRINTING" 
            ) {

                online++;
                printing++;

            }
            else if (
                status === "OFFLINE"
            ) {

                offline++;

            }
            else if (
                status === "ERROR" ||
                status === "STOPPED"
            ) {

                errors++;

            }

        //});
        }

        res.json({

            success: true,

            data: {

                monitor:
                    this.monitor.stats(),

                printers: {

                    total:
                        printers.length,

                    online,

                    offline,

                    printing,

                    errors

                }

            }

        });

    }

}

module.exports = MonitorController;