"use strict";

const Bootstrap = require("./bootstrap");

(async () => {

    try {

        const app = new Bootstrap();
        await app.initialize()
        await app.start();

        process.on("SIGINT", async () => {

            await app.stop();

            process.exit(0);

        });

        process.on("SIGINT", async () => {

            await app.stop();

            process.exit(0);

        });

    }
    catch (err) {

        console.error("Fehler beim Start des Druckservers");
        console.error(err);

        process.exit(1);

    }

})();