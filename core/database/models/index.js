"use strict";

const PrinterModel = require("./PrinterModel"); 
const QueueModel = require("./QueueModel");
const JobModel = require("./JobModel");

module.exports = function initModels(sequelize) { 

    const Printer = PrinterModel(sequelize);
    const Queue = QueueModel(sequelize);
    const Job = JobModel(sequelize);

    /*
    // Beziehungen
    //

    Printer.hasOne(

        Queue,

        {

            foreignKey: "printerId",

            as: "queue"

        }

    );

    Queue.belongsTo(

        Printer,

        {

            foreignKey: "printerId"

        }

    );

    Printer.hasMany(

        Job,

        {

            foreignKey: "printerId",

            as: "jobs"

        }

    );

    Job.belongsTo(

        Printer,

        {

            foreignKey: "printerId"

        }

    );

    Queue.hasMany(

        Job,

        {

            foreignKey: "queueId",

            as: "jobs"

        }

    );

    Job.belongsTo(

        Queue,

        {

            foreignKey: "queueId"

        }

    );*/

    return {

        sequelize,

        Printer,

        Queue,

        Job

    };
}

