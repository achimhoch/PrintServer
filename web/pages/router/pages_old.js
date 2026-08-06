const express = require('express');
const PrinterManger = require("../../../core/managers/PrinterManager");

const printerManager = new PrinterManger();

const router = express.Router();

router.get("/status", (req, res) => {

    res.json({

        application: "Node Print Server", 

        version: "1.0.0",

        status: "running"

    });
});



router.get("/printer", (req, res) => {
    res.render("printers/index");
});

router.get("/printer/:id", (req, res) => {
    console.log(req.params.id);

    res.render("printers/view", { printer: printer, });
});

module.exports = router;