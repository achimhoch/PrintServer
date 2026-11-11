"use strict";
const BaseService = require("./BaseService");


const PRINTER_STATUS = Object.freeze({
    OFFLINE: "OFFLINE",
    ONLINE: "ONLINE",
    PRINTING: "PRINTING",
    ERROR: "ERROR"
});


class PrinterService extends BaseService {

    constructor(repository, eventBus) {

        //this.repository = repository;
        //this.eventBus = eventBus;
        super(repository, eventBus);
    }
    //----------------------------------------------------------
    //Druckerstatus normalisieren und validieren
    //----------------------------------------------------------
    normalizedStatus(status) {
        //console.log(status);
        const normalized = String(status || "").trim().toUpperCase();
        //console.log(normalized);
        if (!Object.values(PRINTER_STATUS).includes(normalized)) {
            throw new Error(`Ungültiger Druckerstatus: ${status}`);
        }

        const aliases = {
            IDLE: PRINTER_STATUS.ONLINE,
            READY: PRINTER_STATUS.ONLINE,
            ONLINE: PRINTER_STATUS.ONLINE,

            BUSY: PRINTER_STATUS.PRINTING,
            PROCESSING: PRINTER_STATUS.PRINTING,
            PRINTING: PRINTER_STATUS.PRINTING,

            STOPPED: PRINTER_STATUS.OFFLINE,
            OFFLINE: PRINTER_STATUS.OFFLINE,

            ERROR: PRINTER_STATUS.ERROR,
            UNAVAILABLE: PRINTER_STATUS.OFFLINE 
        };

        return aliases[value] || null;
    }
    //----------------------------------------------------------
    //Statusfelder zentral erzeugen
    //----------------------------------------------------------
    getStatusFields(status) {
        //console.log(status);
        const normalized = this.normalizedStatus(status);

        return {
            status: normalized,
            online: normalized !== PRINTER_STATUS.OFFLINE,
            busy: normalized !== PRINTER_STATUS.PRINTING
        };
    }
    //----------------------------------------------------------
    //Statussnapshot für Monitor
    //----------------------------------------------------------
    getStatusSnapshot(printer) {
        const status = this.normalizedStatus(printer.status) || (printer.online ? PRINTER_STATUS.ONLINE : PRINTER_STATUS.OFFLINE);

        return {
            status,
            online: status !== PRINTER_STATUS.OFFLINE,
            busy: status === PRINTER_STATUS.PRINTING 
        };
    }
    //----------------------------------------------------------
    //Druckerstatus aktualisieren
    //----------------------------------------------------------
    async setStatus(id, status) {
        const printer = await this.findById(id);

        if (!printer) {
            return null;
        }

        const oldStatus = this.normalizedStatus(printer.status) || (printer.online ? PRINTER_STATUS.ONLINE : PRINTER_STATUS.OFFLINE);
        const fields = this.getStatusFields(status);

        const values = {
            ...fields,
            lastSeen: fields.online ? new Date() : printer.lastSeen
        };
       

      
        const updated = await this.update(id, values);



        if (oldStatus !== fields.status) {
            this.eventBus.publish("printer.statusChanged", {
                printer: updated,
                oldStatus,
                newStatus: fields.status

            });
        }

        this.eventBus.publish("printer.updated", updated);

        return updated;
    }
    
    //----------------------------------------------------------
    //Drucker bei erfolgreicher Kommunikation aktualisieren
    //----------------------------------------------------------
    async touch(id) {
        const printer = await this.findById(id);

        if (!printer) {
            return null;
        }

        // Erreichbarkeit bestätigen, BUSY-Status aber beibehalten.
        const currentStatus =
            String(printer.status || "").toUpperCase();

        const status =
            currentStatus === PRINTER_STATUS.BUSY
                ? PRINTER_STATUS.BUSY
                : PRINTER_STATUS.IDLE;

        const fields = this.getStatusFields(status);

        const updated = await this.update(id, {
            ...fields,
            lastSeen: new Date()
        });

        this.eventBus?.publish("printer.updated", updated);

        return updated;
    }
    
    //----------------------------------------------------------  
    // Discovery
    //----------------------------------------------------------

    async upsertDiscovery(printer) {

        if (!printer || (!printer.ip && !printer.uuid && !printer.url)) {
            throw new Error("Drucker benötigt eine Ip, UUID oder URI");
        }

        const data = {
            ...printer,
            ...this.getStatusFields(printer.status || PRINTER_STATUS.ONLINE),
            lastSeen: new Date()
        };
        
        const entity = this.repository.upsertDiscovery(data);

        this. eventBus.publish("printer.updated", entity);

        return entity;

        

    }
    //----------------------------------------------------------
    //Druckerstatus aktualisieren
    //----------------------------------------------------------
    async updateStatus(id, driverState) {
        if (!driverState)
            throw new Error("Treiberstatus ist leer.");

        const printer = await this.findById(id);

        if (!printer)
            return null;

        const rawStatus = typeof driverState === "string" ? driverState : driverState.status;
        const status = this.normalizedStatus(rawStatus);

        if (!status) {
            throw new Error("Unbekannter Status vom Treiber empfangen.");
        }

        const values = {
            ...(typeof driverState === "object" ? driverState : {}),
            ...this.getStatusFields(status),
            lastSeen: new Date()
        };

        const updated = await this.update(id, values);

        this.eventBus.publish("printer.updated", updated);

        return this.getStatusSnapshot(updated);
    }
    //----------------------------------------------------------
    // Update
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
    async findById(id) {
        return this.repository.findById(id);
    }
    //----------------------------------------------------------
    async findByIp(id) {
        return this.repository.findByIp(id);
    }

    //----------------------------------------------------------

    async findOnline() {
        return this.repository.findOnline();
    }
    //----------------------------------------------------------
    async setOffline(ip) {
        const printer = await this.findById(ip);

        if (!printer) {
            return null;
        }

        return this.setStatus(printer.id, PRINTER_STATUS.OFFLINE);
    }
    //----------------------------------------------------------
    async getOnline() {
        return this.findOnline();
    }
    //----------------------------------------------------------
    async getIdle() {
        return this.repository.findIdle();
    }
    //----------------------------------------------------------
    async getBusy() {
        return this.repository.findBusy();
    }
    //----------------------------------------------------------
    async getOffline() {
        return this.repository.findOffline();
    }
    //----------------------------------------------------------
    async getPrinting() {
        return this.repository.findPrinting();
    }
    //----------------------------------------------------------
    async statistics() {

        return this.repository.statistics();

    }

}

PrinterService.STATUS = PRINTER_STATUS;0

module.exports = PrinterService;