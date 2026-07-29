"use strict";

class PrinterService {

    constructor(repository) {

        this.repository = repository;

    }

    //----------------------------------------------------------
    // Discovery
    //----------------------------------------------------------

    async upsertDiscovery(printer) {
        //console.log(printer);
        let existing = null;

        if (printer.uuid) {

            existing = await this.repository.findByUuid(

                printer.uuid

            );

        }

        if (!existing && printer.ip) {

            existing = await this.repository.findByIp(

                printer.ip

            );

        }

        if (existing) {

            return this.repository.update(

                existing.id,

                {

                    ...printer,

                    online: true,

                    lastSeen: new Date()

                }

            );

        }

        return this.repository.create({

            ...printer,

            online: true,

            discovered: true,

            lastSeen: new Date()

        });

    }

    //----------------------------------------------------------

    async update(id, values) {

        return this.repository.update(

            id,

            values

        );

    }

    //----------------------------------------------------------

    async findAll() {

        return this.repository.findAll();

    }

    //----------------------------------------------------------

    async findOnline() {

        return this.repository.findOnline();

    }

    //----------------------------------------------------------

    async statistics() {

        return this.repository.stats();

    }

}

module.exports = PrinterService;