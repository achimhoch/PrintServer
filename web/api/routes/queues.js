const JobController = require("../controllers/JobController");
const ApiRouter = require("../ApiRouter");
const QueueController = require("../controllers/QueueController");

class QueueRoutes {

    constructor(bootstrap) { 

        this.queueController = new QueueController(bootstrap);
        this.jobController = new JobController(bootstrap);

        this.router = new ApiRouter();

        this.build();

    }

    //----------------------------------------------------------

    build() {

        this.router.get(

            "/",

            this.queueController.list

        );

        this.router.get(

            "/statistics",

            this.queueController.statistics

        );

        this.router.get(

            "/:id",

            this.queueController.get

        );

        this.router.post(

            "/",

            this.queueController.create

        );

        this.router.put(

            "/:id",

            this.queueController.update

        );

        this.router.delete(

            "/:id",

            this.queueController.remove 

        );

        this.router.get(
            "/:id/status",

            this.queueController.status
        );

        this.router.post(
            "/:id/pause",
            this.queueController.pause
        );

        this.router.post(
            "/:id/resume",
            this.queueController.resume
        );

        this.router.post(
            "/:id/enable",
            this.queueController.enable
        );

        this.router.post(
            "/:id/disable",
            this.queueController.disable
        );

        //--------------------------------------------

        this.router.get(
            "/:id/jobs",
            this.jobController.findByQueue
        );

        this.router.post(
            "/:id/job",
            this.jobController.findJob
        );



        

        return this.router.build();

    }

}

module.exports = QueueRoutes;