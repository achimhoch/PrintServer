"use strict";

const net = require("net");

const DiscoveryProvider = require("../DiscoveryProvider");
const logger = require("../../logging/LogManager").getLogger("IppScanProvider");  

class IppScanProvider extends DiscoveryProvider {  

    constructor(options = {}, driver) {

        super({
            name: "IppScanProvider",
            type: "ipp",
            ...options
        });

        this.driver = driver || null;
    
        this.options = {

            enabled: true,

            port: 631,

            timeout: 1500, 

            concurrency: 64,

            networks: [],

            excludeIps: [],

            excludeRanges: [],

            path: "/ipp/print",

            ...options

        };

    }

    //----------------------------------------------------------
    // Initialisieren
    //----------------------------------------------------------

    async initialize() {
        if (this.initialized) 
            return;

        if (!this.driver) {
            logger.error("Ipp-Treiber benötigt.");
            throw new Error("IPPScanProvider: IPP-Treiber wird benötigt.");
        }

        await super.initialize();
        logger.info("IppScanProvider initialisiert...");
    }

    //----------------------------------------------------------
    // Start
    //----------------------------------------------------------

    async start() {
    
        if (this.running)
            return;

        if (!this.enabled)
            return;

        await super.start();

    }

    //----------------------------------------------------------
    // Stop
    //----------------------------------------------------------

    async stop() {

       await super.stop(); 

    }

    //----------------------------------------------------------
    // Gesamten Scan starten
    //----------------------------------------------------------

    async scan() {

        if (!this.running)
          return [];

        await super.scan();

        const results = [];

        //console.log(this.options.networks);
        for (const subnet of this.options.networks) {
            logger.info("Scanne:", subnet);

            try {
                if (!this.running)
                    break;

                const found = await this.scanNetwork(subnet);
                results.push(...found);
                logger.info("Fertig", subnet);
            } 
            catch (err) {
                logger.error(err);

            }          

        }
        
        return results;

    }

    //----------------------------------------------------------
    // Ein Netzwerksegment
    //----------------------------------------------------------

    async scanNetwork(subnet) {
        //const hosts = this.expandCIDR(cidr);
        const results = [];
        const batch = [];

        //console.log(hosts);
        for (let host = 1; host < 255; host++) {
            if(!this.running)
                break;

            const address = `${subnet}.${host}`;
            //logger.info(address);
            batch.push(this.scanHost(address));

            if (batch.length >= this.options.concurrency) {
                const values = await Promise.allSettled(batch);
               
                for (const value of values) {
                    if (value.status === "fulfilled" && value.value) {
                        results.push(value.value);
                    }
                }
                batch.length = 0;

            }
        }

        if (batch.length) {
            const values = await Promise.allSettled(batch);

            for (const value of values) {
                if (value.status === "fulfilled" && value.value) {
                    results.push(value.value);
                }
            }
        }

        return results;
    }

    


    //----------------------------------------------------------
    // Einen Host prüfen
    //----------------------------------------------------------
    async scanHost(ip) {
       
        return new Promise((resolve) => {

            if (!this.running) {
                return resolve(null);
            }

            const socket = new net.Socket();

            let finished = false;

            const finish = result => {
                if (finished) 
                    return;

                finished = true;

                socket.destroy();

                resolve(result || null);
            };
           
            socket.setTimeout(this.options.timeout);
           
            socket.once("connect", async () => {

                try {
                    const printer =  await this.readPrinter(ip);
                    finish(printer);
                }
                catch (error) {
                    this.error(error);
                    finish(null);
                }   
            });

            

            socket.once("timeout", () => {
                finish(null);
            });

            socket.once("error", () => {
                finish(null)
            });

            socket.connect(this.options.port, ip);

        });

    }

    //----------------------------------------------------------
    // Druckerinformationen lesen
    //---------------------------------------------------------- 

    async readPrinter(ip) {
       //console.log(ip);

        if (!this.driver)
            return null;

        const uri = {uri: `ipp://${ip}:${this.options.port}` + `${this.options.path}`};
        //console.log(uri);
        //const printer = {uri: `ipps://192.168.0.46:631/ipp/print`};

        try {

            //-------------------------------------------------- 
            // über IppDriver
            //--------------------------------------------------
            
            
            const info = await this.driver.getPrinterAttributes(uri);
            //console.log("Info: ", info.status);
            if (!info)
                return null;

            

            const printer = {
                uuid: info.uuid || null,

                name: info.name || ip,

                host: info.host || ip,

                ip,

                uri: info.uri || `ipp://${ip}:631/ipp/print`,

                protocol: "ipp",

                manufacturer: info.manufacturer || "",

                model: info.model ||  "",

                location: info.location ||  "",

                status: info.state || "Unbekannt",

                color: info.color || false,

                duplex: info.duplex || false,

                online: true,

                discovered: true,

                discoveryProvider: "ipp"
            };

            this.found(printer);

            return printer;

        }
        catch (err) {

            this.error(err);

            return null;

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