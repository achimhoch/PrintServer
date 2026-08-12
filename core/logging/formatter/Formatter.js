"use strict";

class Formatter {

    format(level, logger, message, data) {

        const timestamp =

            new Date().toISOString();

        let line =
            `[${timestamp}] ` +
            `[${level}] ` +
            `[${logger}] ` +
            message;

        if (data !== undefined) {

            line +=
                " " +
                JSON.stringify(data);

        }

        return line;

    }

}

module.exports = Formatter;