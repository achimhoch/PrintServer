"use strict";

const net = require("net");
const ping = require("ping");
const ip = require("ip");
const ipp = require("ipp");

const DiscoveryProvider = require("../DiscoveryProvider");

class IppScanProvider extends DiscoveryProvider {

    constructor(options = {}) {

        super({

            name: "IPP Scan",

            type: "ipp",

            ...options

        });

        this.segments = options.segments || [];

        this.port = options.port || 631;

        this.timeout = options.timeout || 1000;

        this.concurrency = options.concurrency || 32;

        this.path = options.path || "/ipp/print";

    }

    //----------------------------------------------------------
    // Scan
    //----------------------------------------------------------

    async scan() {

        await super.scan();

        const hosts = [];

        for (const network of this.segments) {

            hosts.push(

                ...this.expandNetwork(network)

            );

        }

        await this.runWorkers(hosts);

        return this.getPrinters();

    }

    //----------------------------------------------------------
    // Worker Pool
    //----------------------------------------------------------

    async runWorkers(hosts) {

        let index = 0;

        const workers = [];

        const worker = async () => {

            while (index < hosts.length) {

                const host = hosts[index++];

                try {

                    await this.scanHost(host);

                }

                catch (err) {

                    this.error(err);

                }

            }

        };

        for (

            let i = 0;

            i < this.concurrency;

            i++

        ) {

            workers.push(

                worker()

            );

        }

        await Promise.all(workers);

    }

    //----------------------------------------------------------
    // Host scannen
    //----------------------------------------------------------

    async scanHost(host) {

        //------------------------------------------------------
        // Ping
        //------------------------------------------------------

        const pingResult = await ping.promise.probe(

            host,

            {

                timeout: this.timeout / 1000

            }

        );

        if (!pingResult.alive)
            return;

        //------------------------------------------------------
        // Port 631
        //------------------------------------------------------

        const open = await this.testPort(host);

        if (!open)
            return;

        //------------------------------------------------------
        // IPP
        //------------------------------------------------------

        const printer = await this.readPrinter(host);

        if (!printer)
            return;

        this.found(printer);

    }

    //----------------------------------------------------------
    // Porttest
    //----------------------------------------------------------

    testPort(host) {

        return new Promise(resolve => {

            const socket = new net.Socket();

            socket.setTimeout(

                this.timeout

            );

            socket.once(

                "connect",

                () => {

                    socket.destroy();

                    resolve(true);

                }

            );

            socket.once(

                "timeout",

                () => {

                    socket.destroy();

                    resolve(false);

                }

            );

            socket.once(

                "error",

                () => {

                    resolve(false);

                }

            );

            socket.connect(

                this.port,

                host

            );

        });

    }

    //----------------------------------------------------------
    // IPP Attributes
    //----------------------------------------------------------

    readPrinter(host) {

        return new Promise(resolve => {

            const printer = ipp.Printer(

                `http://${host}:${this.port}${this.path}`

            );

            printer.execute(

                "Get-Printer-Attributes",

                null,

                (err, res) => {

                    if (err)

                        return resolve(null);

                    const attr =

                        res["printer-attributes-tag"];

                    resolve({

                        id:

                            attr["printer-uuid"] ||

                            host,

                        ip: host,

                        host,

                        protocol: "ipp",

                        uri:
                            `ipp://${host}${this.path}`,

                        name:

                            attr["printer-name"],

                        manufacturer:

                            attr["printer-make-and-model"],

                        location:

                            attr["printer-location"],

                        state:

                            attr["printer-state"],

                        color:

                            attr["color-supported"],

                        duplex:

                            attr["sides-supported"],

                        jobs:

                            attr["queued-job-count"],

                        driver: "ipp"

                    });

                }

            );

        });

    }

    //----------------------------------------------------------
    // CIDR erweitern
    //----------------------------------------------------------

    expandNetwork(cidr) {

        const subnet = ip.cidrSubnet(cidr);

        const hosts = [];

        let current = ip.toLong(

            subnet.firstAddress

        );

        const end = ip.toLong(

            subnet.lastAddress

        );

        while (

            current <= end

        ) {

            hosts.push(

                ip.fromLong(current)

            );

            current++;

        }

        return hosts;

    }

}

module.exports = IppScanProvider;