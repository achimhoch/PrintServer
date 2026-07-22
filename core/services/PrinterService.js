"use strict";

const BaseService = require("./BaseService");

class PrinterService extends BaseService {

    constructor(repository, eventBus) {

        super(repository, eventBus);

    }

    //----------------------------------------------------------

    async upsertDiscoveredPrinter(printer) {

        let entity = await this.repository.findByIp(

            printer.ip

        );

        if (!entity) {

            entity = await this.repository.add({

                ...printer,

                online: true,

                lastSeen: new Date()

            });

        }

        else {

            entity = await this.repository.update(

                entity.id,

                {

                    ...printer,

                    online: true,

                    lastSeen: new Date()

                }

            );

        }

        this.eventBus.publish(

            "printer.updated", 

            entity

        );

        return entity;

    }

    //----------------------------------------------------------

    async setOffline(ip) {

        const printer = await this.repository.findByIp(ip);

        if (!printer)

            return null;

        return this.repository.update(

            printer.id,

            {

                online: false

            }

        );

    }

    //----------------------------------------------------------

    async getOnline() {

        return this.repository.findOnline();

    }

    //----------------------------------------------------------

    async statistics() {

        return this.repository.stats();

    }

}

module.exports = PrinterService;