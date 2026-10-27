const AppController = require("../controllers/AppController"); 

const ApiRouter = require("../ApiRouter");

class AppRoutes {

    constructor(bootstrap) { 

        this.controller = new AppController(bootstrap);
       

        this.router = new ApiRouter(

                this.controller,
            );

        this.build();

    }

    //----------------------------------------------------------  

    build() {

        this.router.get(

            "/printer",

            this.controller.printers

        );

        this.router.get(

            "/printer/:id",

            this.controller.getPrinter

        );

        this.router.get(

            "/queues",

            this.controller.queues

        );

        this.router.get(

            "/queues/:id",

            this.controller.getQueue

        );

      this.router.get("/test", (req, res) => {
        return res.status(200).json({
            success: true,
            message: "App-API erreichbar",
            path: req.originalUrl,
            contenttype: "application/json"
        });
      });

        

        return this.router.build();

    }

}

module.exports = AppRoutes;