"use strict";

const express = require("express");

class ApiRouter {

    constructor(controller) {

        this.router = express.Router();

        this.controller = controller;

    }

    //----------------------------------------------------------
    // Async Wrapper
    //----------------------------------------------------------

    route(method, path, handler) {

        this.router[method](

            path,

            async (req, res, next) => {

                try {

                    await handler.call(

                        this.controller,

                        req,

                        res,

                        next

                    );

                }
                catch (err) {

                    next(err);

                }

            }

        );

    }

    //----------------------------------------------------------

    get(path, handler) {

        this.route(

            "get",

            path,

            handler

        );

    }

    //----------------------------------------------------------

    post(path, handler) {

        this.route(

            "post",

            path,

            handler

        );

    }

    //----------------------------------------------------------

    put(path, handler) {

        this.route(

            "put",

            path,

            handler

        );

    }

    //----------------------------------------------------------

    patch(path, handler) {

        this.route(

            "patch",

            path,

            handler

        );

    }

    //----------------------------------------------------------

    delete(path, handler) {

        this.route(

            "delete",

            path,

            handler

        );

    }

    //----------------------------------------------------------

    build() {

        return this.router;

    }

}

module.exports = ApiRouter;