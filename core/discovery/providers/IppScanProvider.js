"use strict";

const { EventEmitter } = require("events");
const ipp = require("ipp");
const ping = require("ping");
const ip = require("ip");

class IppScanProvider extends EventEmitter {

    constructor(options = {}) {

        super();

        this.networks = options.networks || [];

        this.port = options.port || 631;

        this.timeout = options.timeout || 1500;

        this.concurrency = options.concurrency || 50;

        this.found = new Map();

        this.running = false;

        this.timer = null;

        this.interval = options.interval || 300000;

    }

    //----------------------------------------------------------
    // Lifecycle
    //----------------------------------------------------------

    async start() {

        if (this.running)
            return;

        this.running = true;

        await this.scan();

        this.timer = setInterval(async () => {

            await this.scan();

        }, this.interval);

    }

    async stop() {

        this.running = false;

        clearInterval(this.timer);

    }

    //----------------------------------------------------------
    // Scan
    //----------------------------------------------------------

    async scan() {

        const hosts = [];

        for (const network of this.networks) {

            hosts.push(

                ...this.expandNetwork(network)

            );

        }

        for (let i = 0; i < hosts.length; i += this.concurrency) {

            const batch = hosts.slice(

                i,
                i + this.concurrency

            );

            await Promise.all(

                batch.map(ip => this.scanHost(ip))

            );

        }

    }

    //----------------------------------------------------------
    // Host
    //----------------------------------------------------------

    async scanHost(address) {

        try {

            const alive = await ping.promise.probe(address, {

                timeout: 1

            });

            if (!alive.alive)
                return;

            const printer = ipp.Printer(

                `http://${address}:${this.port}/ipp/print`

            );

            const response = await new Promise((resolve, reject) => {

                printer.execute(
                    "Get-Printer-Attributes",
                    null,
                    (err, res) => {

                        if (err)
                            return reject(err);

                        resolve(res);

                    }
                );

            });

            const attrs = response["printer-attributes-tag"];

            const id = attrs["printer-uuid"] ||
                       attrs["printer-uri-supported"] ||
                       address;

            const info = {

                id,

                protocol: "ipp",

                ip: address,

                uri: attrs["printer-uri-supported"],

                name: attrs["printer-name"] || address,

                location: attrs["printer-location"] || "",

                manufacturer:

                    attrs["printer-make-and-model"] || "",

                state: attrs["printer-state"],

                color:

                    attrs["color-supported"],

                duplex:

                    attrs["sides-supported"],

                driver: "ipp"

            };

            if (!this.found.has(id)) {

                this.found.set(id, info);

                this.emit(

                    "printerFound",

                    info

                );

            }
            else {

                this.found.set(id, info);

                this.emit(

                    "printerUpdated",

                    info

                );

            }

        }
        catch (err) {

            // Host ist kein IPP-Drucker

        }

    }

    //----------------------------------------------------------
    // CIDR -> Hosts
    //----------------------------------------------------------

    expandNetwork(cidr) {

        const subnet = ip.cidrSubnet(cidr);

        const hosts = [];

        let current = ip.toLong(subnet.firstAddress);

        const end = ip.toLong(subnet.lastAddress);

        while (current <= end) {

            hosts.push(

                ip.fromLong(current)

            );

            current++;

        }

        return hosts;

    }

}
module.exports = IppScanProvider;