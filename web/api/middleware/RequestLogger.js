"use strict";

module.exports = eventBus => {

    return (req, res, next) => {

        const start = Date.now();

        res.on("finish", () => {

            const duration = Date.now() - start;

            eventBus.publish(

                "httpRequest",

                {

                    method: req.method,

                    url: req.originalUrl,

                    status: res.statusCode,

                    duration,

                    ip: req.ip

                }

            );

        });

        next();

    };

};