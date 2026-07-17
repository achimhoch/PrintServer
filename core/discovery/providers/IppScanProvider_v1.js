"use strict";

const ping = require("ping");
const ip = require("ip");

const DiscoveryProvider = require("./DiscoveryProvider");

class IppScanProvider extends DiscoveryProvider {

    constructor(options = {}) {

        super({name: "IPP", type: "ipp", ...options});

        this.segments = options.segments || [];

        this.timeout = options.timeout || 1000;

    }

    async start() {

        this.running = true;

        for (const subnet of this.segments) {

            await this.scanSubnet(subnet);

        }

    }

    async stop() {

        this.running = false;

    }

    //----------------------------------------------------------

    async scanSubnet(cidr) {

        const subnet = ip.cidrSubnet(cidr);

        const start = ip.toLong(subnet.networkAddress);

        const end = ip.toLong(subnet.broadcastAddress);

        for (let addr = start + 1; addr < end; addr++) {

            if (!this.running)
                return;

            const host = ip.fromLong(addr);

            try {

                const result = await ping.promise.probe(host, {

                    timeout: this.timeout / 1000

                });

                if (!result.alive)
                    continue;

                this.emit("printer", {

                    ip: host,

                    host,

                    protocol: "ipp",

                    uri: `ipp://${host}/ipp/print`,

                    discovery: {

                        provider: "ippscan"

                    }

                });

            }
            catch (err) {

                this.emit("error", err);

            }

        }

    }

}

module.exports = IppScanProvider;