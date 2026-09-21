"use strict";

const logger = require("../../../core/logging/LogManager").getLogger("DiscoveryController");

class DiscoveryController {

    constructor(bootstrap) {
        this.bootstrap = bootstrap;
        this.discovery = bootstrap.discovery;
        this.scan = this.scan.bind(this);
        this.status = this.status.bind(this);
        
    }

    /**
     * POST /api/discovery/scan
     */
    async scan(req, res) {

        try {

            if (!this.discovery.running) {
                return res.status(503).json({
                    success: false,
                    scanning: false,
                    error: {
                        code:  "Discovery is not running.",
                        message: "Discovery läuft nicht..."
                    } 
                });
            }
   
            if (this.discovery.scanning) {
                return res.status(409).json({
                    success: false,
                    scanning: true,
                    error: {
                        code: "DISCOVERY_SCAN_RUNNING",
                        message: "Scan läuft bereits."
                    }
                });
            }

    // Scan bewusst nicht blockierend starten
            this.discovery.manualScan()
                .catch(error => {
                    logger.error(
                        "Manueller Scan fehlgeschlagen:" + error.message
                    );
                });

            return res.status(202).json({
                success: true,
                scanning: true,
                message: "Scan gestartet.",
                discovery: this.discovery.status()
            });

        } catch (error) {

            logger.error(
                "Scan-Rückmeldung schlug fehl:" + error.message
            );

            return res.status(500).json({
                success: false,
                scanning: false,
                error: {
                    code: error.code || "DISCOVERY_SCAN_ERROR",
                    message: error.message
                }
            });
        }
    }


    /**
     * GET /api/discovery/status
     */
    async status(req, res) {

        try {

            return res.json({
                success: true,
                discovery: this.discovery.status()  
            });

        } catch (error) {

            logger.error("Status schlug fehl:" + error.message);
            return res.status(500).json({
                success: false,
                error: {
                    code: "DISCOVERY_STATUS_ERROR",
                    message: error.message
                }
            });
        }
    }

    async list(req, res, next) {
        return res.json("test");
    }
}

module.exports = DiscoveryController;