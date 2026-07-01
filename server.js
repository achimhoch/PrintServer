"use strict";

const Bootstrap = require("./Bootstrap");

(async () => {

    try {

        const app = new Bootstrap();

        await app.start();

    }
    catch (err) {

        console.error("Fehler beim Start des Druckservers");
        console.error(err);

        process.exit(1);

    }

})();