"use strict";

const net = require("net");

const DiscoveryProvider = require("../DiscoveryProvider");

class IppScanProvider extends DiscoveryProvider {

    constructor(options = {}, driver) {

        super("IppScanProvider");

        this.driver = driver;

        this.options = {

            enabled: true,

            port: 631,

            timeout: 1500,

            concurrency: 64,

            subnets: [

                "141.13.14"

            ],

            ...options

        };

    }

    //----------------------------------------------------------
    // Initialisieren
    //----------------------------------------------------------

    async initialize() {

    }

    //----------------------------------------------------------
    // Start
    //----------------------------------------------------------

    async start() {

        if (this.running)
            return;

        this.running = true;

        await this.scan();

    }

    //----------------------------------------------------------
    // Stop
    //----------------------------------------------------------

    async stop() {

        this.running = false;

    }

    //----------------------------------------------------------
    // Gesamten Scan starten
    //----------------------------------------------------------

    async scan() {

        if (!this.options.enabled)
            return;

        for (const subnet of this.options.subnets) {

            if (!this.running)
                break;

            await this.scanSubnet(

                subnet

            );

        }

    }

    //----------------------------------------------------------
    // Ein Netzwerksegment
    //----------------------------------------------------------

    async scanSubnet(subnet) {

        const batch = [];

        for (let host = 1; host < 255; host++) {

            batch.push(

                this.scanHost(

                    `${subnet}.${host}`

                )

            );

            if (

                batch.length >=

                this.options.concurrency

            ) {

                await Promise.all(batch);

                batch.length = 0;

            }

        }

        if (batch.length)

            await Promise.all(batch);

    }

    //----------------------------------------------------------
    // Einen Host prüfen
    //----------------------------------------------------------

    scanHost(ip) {

        return new Promise(resolve => {

            const socket = new net.Socket();

            socket.setTimeout(

                this.options.timeout

            );

            socket.once(

                "connect",

                async () => {

                    socket.destroy();

                    await this.readPrinter(ip);

                    resolve();

                }

            );

            socket.once(

                "timeout",

                () => {

                    socket.destroy();

                    resolve();

                }

            );

            socket.once(

                "error",

                () => {

                    resolve();

                }

            );

            socket.connect(

                this.options.port,

                ip

            );

        });

    }

    //----------------------------------------------------------
    // Druckerinformationen lesen
    //----------------------------------------------------------

    async readPrinter(ip) {

        try {

            //--------------------------------------------------
            // über IppDriver
            //--------------------------------------------------

            const info =

                await this.driver.getPrinterAttributes({

                    uri:

                        `ipp://${ip}:631/ipp/print`

                });

            if (!info)
                return;

            this.emit(

                "printer",

                {

                    uuid:

                        info.uuid ||

                        null,

                    name:

                        info.name ||

                        ip,

                    host:

                        info.host ||

                        ip,

                    ip,

                    uri:

                        info.uri ||

                        `ipp://${ip}:631/ipp/print`,

                    protocol: "ipp",

                    manufacturer:

                        info.manufacturer ||

                        "",

                    model:

                        info.model ||

                        "",

                    location:

                        info.location ||

                        "",

                    color:

                        info.color ||

                        false,

                    duplex:

                        info.duplex ||

                        false,

                    online: true,

                    discovered: true,

                    discoveryProvider:

                        "ipp"

                }

            );

        }
        catch (err) {

            this.emit(

                "error",

                err

            );

        }

    }

}
module.exports = IppScanProvider;