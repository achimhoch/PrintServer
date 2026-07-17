"use strict";

const IppDriver = require("./providers/IppDriver");
/*const Raw9100Driver = require("./providers/Raw9100Driver");
const LprDriver = require("./providers/LprDriver");
const CupsDriver = require("./providers/CupsDriver");
const WindowsDriver = require("./providers/WindowsDriver");
const PdfDriver = require("./providers/PdfDriver");
const NullDriver = require("./providers/NullDriver");*/

class DriverFactory {

    static create(options = {}) {

        return [

            new IppDriver(options.ipp)

            //new Raw9100Driver(options.raw),

            //new LprDriver(options.lpr),

            //new CupsDriver(options.cups),

            //new WindowsDriver(options.windows),

            //new PdfDriver(options.pdf),

            //new NullDriver(options.null)

        ];

    }

}

module.exports = DriverFactory;