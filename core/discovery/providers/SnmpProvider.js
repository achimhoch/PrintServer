"use strict";

const snmp = require("net-snmp");

const DiscoveryProvider = require("../DiscoveryProvider");

class SnmpProvider extends DiscoveryProvider {

    constructor(options = {}) {

        super("SnmpProvider");

        this.options = {

            enabled: true,

            port: 161,

            version: "2c",

            community: "public",

            timeout: 1500,

            retries: 1,

            concurrency: 32,

            subnets: [],

            excludeIps: [],

            ...options

        };

        this.running = false;

    }

    //----------------------------------------------------------
    // Initialisieren
    //----------------------------------------------------------

    async initialize() {

        if (!this.options.enabled)
            return;

    }

    //----------------------------------------------------------
    // Start
    //----------------------------------------------------------

    async start() {

        if (this.running)
            return;

        if (!this.options.enabled)
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

        if (!this.running)
            return;

        for (const subnet of this.options.subnets) {

            if (!this.running)
                break;

            await this.scanSubnet(subnet);

        }

    }

    //----------------------------------------------------------
    // Subnetz scannen
    //----------------------------------------------------------

    async scanSubnet(subnet) {

        const batch = [];

        for (let host = 1; host < 255; host++) {

            if (!this.running)
                break;

            const ip = `${subnet}.${host}`;

            if (this.isExcluded(ip))
                continue;

            batch.push(

                this.scanHost(ip)

            );

            if (
                batch.length >=
                this.options.concurrency
            ) {

                await Promise.allSettled(batch);

                batch.length = 0;

            }

        }

        if (batch.length) {

            await Promise.allSettled(batch);

        }

    }

    //----------------------------------------------------------
    // IP ausschließen
    //----------------------------------------------------------

    isExcluded(ip) {

        return this.options.excludeIps.includes(ip);

    }

    //----------------------------------------------------------
    // Einzelnen Host prüfen
    //----------------------------------------------------------

    async scanHost(ip) {

        if (!this.running)
            return null;

        let session = null;

        try {

            session = this.createSession();

            const info = await this.getPrinterInfo(

                session,
                ip

            );

            if (!info)
                return null;

            const printer = {

                ip,

                host: ip,

                port: 631,

                uri:
                    `ipp://${ip}:631/ipp/print`,

                protocol: "ipp",

                name:
                    info.name ||
                    ip,

                manufacturer:
                    info.manufacturer ||
                    "",

                model:
                    info.model ||
                    "",

                serial:
                    info.serial ||
                    "",

                location:
                    info.location ||
                    "",

                online: true,

                discovered: true,

                discovery: {

                    provider: "snmp",

                    protocol: this.options.version,

                    community:
                        this.maskCommunity(),

                    ...info

                }

            };

            this.emit(

                "printer",

                printer

            );

            return printer;

        }
        catch (err) {

            // SNMP timeout ist bei einem Netzwerkscan normal
            if (!this.isTimeoutError(err)) {

                this.emit(

                    "error",

                    {

                        ip,

                        error: err

                    }

                );

            }

            return null;

        }
        finally {

            if (session) {

                try {

                    session.close();

                }
                catch (err) {

                }

            }

        }

    }

    //----------------------------------------------------------
    // SNMP Session erzeugen
    //----------------------------------------------------------

    createSession() {

        const options = {

            port:
                this.options.port,

            timeout:
                this.options.timeout,

            retries:
                this.options.retries,

            transport:
                "udp4"

        };

        if (this.options.version === "1") {

            return snmp.createSession(

                "0.0.0.0",

                this.options.community,

                {

                    ...options,

                    version:
                        snmp.Version1

                }

            );

        }

        return snmp.createSession(

            "0.0.0.0",

            this.options.community,

            {

                ...options,

                version:
                    snmp.Version2c

            }

        );

    }

    //----------------------------------------------------------
    // Druckerinformationen lesen
    //----------------------------------------------------------

    async getPrinterInfo(session, ip) {

        const oids = [

            "1.3.6.1.2.1.1.1.0", // sysDescr
            "1.3.6.1.2.1.1.2.0", // sysObjectID
            "1.3.6.1.2.1.1.5.0", // sysName
            "1.3.6.1.2.1.1.6.0"  // sysLocation

        ];

        const result = await this.get(

            session,
            ip,
            oids

        );

        if (!result)
            return null;

        const info = {

            name:
                result["1.3.6.1.2.1.1.5.0"],

            description:
                result["1.3.6.1.2.1.1.1.0"],

            objectId:
                result["1.3.6.1.2.1.1.2.0"],

            location:
                result["1.3.6.1.2.1.1.6.0"]

        };

        //------------------------------------------------------
        // Nur Geräte akzeptieren, die nach Drucker aussehen
        //------------------------------------------------------

        if (!this.looksLikePrinter(info))
            return null;

        //------------------------------------------------------
        // Hersteller / Modell ermitteln
        //------------------------------------------------------

        const parsed =
            this.parseDescription(

                info.description

            );

        return {

            ...info,

            manufacturer:
                parsed.manufacturer,

            model:
                parsed.model

        };

    }

    //----------------------------------------------------------
    // SNMP GET
    //----------------------------------------------------------

    get(session, ip, oids) {

        return new Promise((resolve, reject) => {

            // Die Session muss für den Zielhost erzeugt werden.
            session.target = ip;

            session.get(

                oids,

                (error, varbinds) => {

                    if (error)
                        return reject(error);

                    const result = {};

                    for (const vb of varbinds) {

                        if (
                            snmp.isVarbindError(vb)
                        ) {

                            continue;

                        }

                        result[vb.oid] =
                            this.varbindValue(

                                vb.value

                            );

                    }

                    resolve(result);

                }

            );

        });

    }

    //----------------------------------------------------------
    // Varbind normalisieren
    //----------------------------------------------------------

    varbindValue(value) {

        if (Buffer.isBuffer(value)) {

            return value.toString();

        }

        return value;

    }

    //----------------------------------------------------------
    // Drucker erkennen
    //----------------------------------------------------------

    looksLikePrinter(info) {

        const text = [

            info.name,

            info.description,

            info.objectId

        ]

        .filter(Boolean)

        .join(" ")

        .toLowerCase();

        const keywords = [

            "printer",
            "print",
            "laserjet",
            "officejet",
            "deskjet",
            "ecotank",
            "epson",
            "canon",
            "brother",
            "kyocera",
            "ricoh",
            "xerox",
            "lexmark",
            "konica",
            "sharp",
            "oki"

        ];

        return keywords.some(

            keyword => text.includes(keyword)

        );

    }

    //----------------------------------------------------------
    // Hersteller / Modell
    //----------------------------------------------------------

    parseDescription(description) {

        if (!description) {

            return {

                manufacturer: "",

                model: ""

            };

        }

        const value =
            String(description);

        const manufacturers = [

            "HP",

            "Hewlett-Packard",

            "Brother",

            "Canon",

            "Epson",

            "Kyocera",

            "Ricoh",

            "Xerox",

            "Lexmark",

            "Konica Minolta",

            "Sharp",

            "OKI"

        ];

        for (const manufacturer of manufacturers) {

            if (
                value
                    .toLowerCase()
                    .includes(
                        manufacturer.toLowerCase()
                    )
            ) {

                return {

                    manufacturer,

                    model: value

                };

            }

        }

        return {

            manufacturer: "",

            model: value

        };

    }

    //----------------------------------------------------------
    // Community nicht in Logs ausgeben
    //----------------------------------------------------------

    maskCommunity() {

        if (!this.options.community)
            return null;

        return "***";

    }

    //----------------------------------------------------------
    // Timeout erkennen
    //----------------------------------------------------------

    isTimeoutError(error) {

        if (!error)
            return false;

        const text =
            String(error.message || error)
                .toLowerCase();

        return (

            text.includes("timeout") ||

            text.includes("timed out")

        );

    }

}

module.exports = SnmpProvider;