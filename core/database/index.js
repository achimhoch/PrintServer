"use strict";

const sequelize = require("./Sequelize");

const PrinterModel = require("./models/PrinterModel");
const QueueModel = require("./models/QueueModel");
const JobModel = require("./models/JobModel");

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

module.exports = {

    sequelize,

    Printer,

    Queue,

    Job

};