
const PrinterListController = require("../controllers/PrinterListController");
const QueueListController = require("../controllers/QueueListController");
const PagesRouter = require("../PagesRouter");

class QueueRoutes {

    constructor(bootstrap) { 

        this.controller =

            new QueueListController(

                bootstrap

            );

        this.router =

            new PagesRouter(

                this.controller 

            );

        this.build();

    }

    //----------------------------------------------------------

    build() {

        this.router.get(

            "/",

            this.controller.list

        );

        this.router.get(

            "/:id",

            this.controller.get

        );

        this.router.post(

            "/",

            this.controller.create

        );

        this.router.put(

            "/:id",

            this.controller.update

        );

        this.router.delete(

            "/:id",

            this.controller.remove 

        );

        

        return this.router.build();

    }

}

module.exports = QueueRoutes;