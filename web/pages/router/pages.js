const express = require('express');



const router = express.Router();

router.get("/", (req, res) => {

    res.json({

        application: "Node Print Server",

        version: "1.0.0",

        status: "running"

    });
});

router.get("/printer", (req, res) => {
    res.render("printers/index");
});

module.exports = router;