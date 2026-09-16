"use strict";

const logger = require("../../../core/logging/LogManager").getLogger("DiscoveryController");

class DiscoveryController {

    constructor(bootstrap) {
        this.bootstrap = bootstrap;

        this.discovery = bootstrap.discovery;    
    }

    /**
     * POST /api/discovery/scan
     */
    async scan(req, res) {

        try {

            if (!this.discovery.running) {
                return res.status(503).json({
                    success: false,
                    error: "Discovery is not running." 
                });
            }

            if (this.discovery.scanning) {
                return res.status(409).json({
                    success: false,
                    scanning: true,
                    message: "Discovery scan läuft bereits."
                });
            }

            // Scan bewusst nicht blockierend starten
            this.discovery.scan()
                .catch(error => {
                    logger.error(
                        "Manueller Discovery Scan fehlgeschlagen:",
                        error
                    );
                });

            return res.status(202).json({
                success: true,
                scanning: true,
                message: "Discovery scan gestartet."
            });

        } catch (error) {

            logger.error(
                "DiscoveryController.scan:",
                error
            );

            return res.status(500).json({
                success: false,
                error: error.message
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

            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = DiscoveryController;