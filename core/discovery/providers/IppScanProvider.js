"use strict";

const net = require("net");

const DiscoveryProvider = require("../DiscoveryProvider");
const logger = require("../../logging/LogManager").getLogger("IppScanProvider");

class IppScanProvider extends DiscoveryProvider { 

    constructor(options = {}, driver) {

        super("IppScanProvider");

        this.driver = driver;
       

        this.options = {

            enabled: true,

            port: 631,

            timeout: 1500,

            concurrency: 64,

            networks: [],

            excludeIps: [],

            excludeRanges: [],

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
        logger.info("Discovery gestartet");

        for (const cidr of this.options.networks) {
        logger.info("Scanne:", cidr);

            try {
                if (!this.running)
                    break;

                await this.scanNetwork(cidr);
        logger.info("Fertig", cidr);
            } 
            catch (err) {
                logger.error("Error: ", err);

            }          

        }
console.log("Discovery beendet");

    }

    //----------------------------------------------------------
    // Ein Netzwerksegment
    //----------------------------------------------------------

    async scanNetwork(cidr) {
        const hosts = this.expandCIDR(cidr);
        const batch = [];
        //console.log(hosts);
        for (const ip of hosts) {
            if (this.isExcluded(ip))
                continue;

            batch.push(this.scanHost(ip));

            if (batch.length >= this.options.concurrency) {
                await Promise.all(batch);
                batch.length = 0;
            }
        }

        if (batch.length)
            await Promise.all(batch);
    }

    /*async scanSubnet(subnet) {

        const batch = [];

        for (let host = 1; host < 255; host++) {

            if (this.options.excludeIps.includes(host)) {
                //console.log(this.options.excludeIps, ':', host)
                continue;
            } 

            batch.push(

                this.scanHost(

                    `${subnet}.${host}`

                )

            );
          
            if (

                batch.length >=

                this.options.concurrency

            ) {
               
                const Batch = await Promise.all(batch);

                batch.length = 0;

            }

        }

        if (batch.length)

            await Promise.all(batch);

    }*/


    //----------------------------------------------------------
    // Einen Host prüfen
    //----------------------------------------------------------
    async scanHost(ip) {

        
       
        return new Promise((resolve) => {
            
            const socket = new net.Socket();
           
            socket.setTimeout(this.options.timeout);
           
            socket.once("connect", async () => {

                   
                    socket.destroy();

                    await this.readPrinter(ip).catch(console.error).finally(resolve);
            
               
                
            });

            

            socket.once("timeout", () => {

                    socket.destroy();

                    resolve();

            });

            socket.once("error", () => {

                    resolve();

            });

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
       //console.log(ip);
        try {

            //-------------------------------------------------- 
            // über IppDriver
            //--------------------------------------------------
            const printer = {uri: `ipp://${ip}:631/ipp/print`};
            const info = await this.driver.getPrinterAttributes(printer);
            //console.log(info.status);
            if (!info)
                return;

            //console.log("EMIT printer");

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

                    status: 

                        info.state || "Unbekannt",

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

    //---------------------------------------------------------------

    expandCIDR(cidr) {
        const [network, mask] = cidr.split("/");
        const prefix = Number(mask);
        const networkInt = this.ipToInt(network);
        const hostBits = 32 - prefix;
        const hostCount = Math.pow(2, hostBits);
        const first = networkInt & (~((1 << hostBits) - 1));
        const ips = [];

        for (let i = 1; i < hostCount - 1; i++) {
            ips.push(this.intToIp(first + i));
        }

        return ips;
    }

    ipToInt(ip) {
        return ip
            .split(".")
            .reduce((v, n) => (v << 8) + Number(n), 0) >>> 0;
    }

    intToIp(value) {
        return [
            (value >>> 24) & 255,
            (value >>> 16) & 255,
            (value >>> 8) & 255,
            value & 255
        ].join(".");
    }

    isExcluded(ip) {
        if (this.options.excludeIps.includes(ip))
            return true;

        const value = this.ipToInt(ip);

        for (const range of this.options.excludeRanges) {
            if (value >= this.ipToInt(range.from) && value <= this.ipToInt(range.to)) {
                return true;
            }
        }

        return false;
    }

}
module.exports = IppScanProvider;