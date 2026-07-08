"use strict";

const mdns = require("multicast-dns")();
const DiscoveryProvider = require("./DiscoveryProvider");

class MdnsProvider extends DiscoveryProvider {

    constructor(options = {}) {

        super(options);

        this.browser = null;

    }

    async start() {

        this.running = true;

        mdns.on("response", response => {

            for (const answer of response.answers) {

                if (!answer.name.includes("_ipp"))
                    continue;

                this.emit("printer", {

                    name: answer.name,

                    host: answer.data,

                    protocol: "ipp",

                    uri: `ipp://${answer.data}/ipp/print`,

                    discovery: {

                        provider: "mdns"

                    }

                });

            }

        });

        mdns.query({

            questions: [{

                name: "_ipp._tcp.local",

                type: "PTR"

            }]

        });

    }

    async stop() {

        this.running = false;

        mdns.destroy();

    }

}

module.exports = MdnsProvider;