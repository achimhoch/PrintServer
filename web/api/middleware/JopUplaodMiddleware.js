"use strict";

const multer = require("multer");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const config = require("config");

class JobUploadMiddleware {

    static create() {

        const uploadConfig =
            config.get("upload");

        const directory =
            path.resolve(
                uploadConfig.directory || "./uploads"
            );

        fs.mkdirSync(
            directory,
            {
                recursive: true
            }
        );

        const storage = multer.diskStorage({

            destination: (req, file, cb) => {

                cb(
                    null,
                    directory
                );

            },

            filename: (req, file, cb) => {

                const id =
                    crypto.randomUUID();

                const extension =
                    path.extname(
                        file.originalname
                    );

                cb(

                    null,

                    `${id}${extension}`

                );

            }

        });

        const maxFileSize =
            JobUploadMiddleware.parseSize(

                uploadConfig.maxFileSize ||
                "100mb"

            );

        return multer({

            storage,

            limits: {

                fileSize:
                    maxFileSize,

                files: 1

            }

        });

    }

    //----------------------------------------------------------
    // Dateigröße
    //----------------------------------------------------------

    static parseSize(value) {

        if (typeof value === "number")
            return value;

        const match =
            String(value)
                .trim()
                .match(
                    /^(\d+(?:\.\d+)?)\s*(kb|mb|gb)?$/i
                );

        if (!match)
            return 100 * 1024 * 1024;

        const number =
            Number(match[1]);

        const unit =
            (match[2] || "b").toLowerCase();

        const multiplier = {

            b: 1,

            kb: 1024,

            mb: 1024 * 1024,

            gb: 1024 * 1024 * 1024

        }[unit];

        return Math.floor(
            number * multiplier
        );

    }

}

module.exports = JobUploadMiddleware;