"use strict";

const BaseService = require("./BaseService");

class QueueService extends BaseService {

    constructor(repository, eventBus) {

        super(
            repository,
            eventBus
        );

    }

    //---------------------------------------------------------- 
    // Queue anlegen
    //----------------------------------------------------------

    async create(queue) {

        return this.repository.add(
            queue
        );

    }

    //----------------------------------------------------------
    // Queue aktualisieren
    //----------------------------------------------------------

    async update(id, values) {

        return this.repository.update(
            id,
            values
        );

    }

    //----------------------------------------------------------
    // Queue entfernen
    //----------------------------------------------------------

    async remove(id) {

        return this.repository.remove(
            id
        );

    }

    //----------------------------------------------------------
    // Queue abrufen
    //----------------------------------------------------------

    async get(id) {

        return this.repository.get(
            id
        );

    }

    //----------------------------------------------------------
    // Alle Queues
    //----------------------------------------------------------

    async all() {

        return this.repository.findAll(); 

    }

    //----------------------------------------------------------
    // Existenz
    //----------------------------------------------------------

    async exists(id) {

        return this.repository.has(
            id
        );

    }

    //----------------------------------------------------------
    // Suche nach Drucker
    //----------------------------------------------------------

    async findByPrinter(printerId) {

        return this.repository.findByPrinter(
            printerId
        );

    }

    //----------------------------------------------------------
    // Name
    //----------------------------------------------------------

    async findByName(name) {

        return this.repository.findByName(
            name
        );

    }

    //----------------------------------------------------------
    // Status
    //----------------------------------------------------------

    async findByStatus(status) {

        return this.repository.findByStatus(
            status
        );

    }

    //----------------------------------------------------------
    // Aktiviert
    //----------------------------------------------------------

    async findEnabled() {

        return this.repository.findEnabled();

    }

    //----------------------------------------------------------
    // Deaktiviert
    //----------------------------------------------------------

    async findDisabled() {

        return this.repository.findDisabled();

    }

    //----------------------------------------------------------
    // Pausiert
    //----------------------------------------------------------

    async findPaused() {

        return this.repository.findPaused();

    }

    //----------------------------------------------------------
    // Verarbeitung
    //----------------------------------------------------------

    async findProcessing() {

        return this.repository.findProcessing();

    }

    //----------------------------------------------------------
    // Leerlauf
    //----------------------------------------------------------

    async findIdle() {

        return this.repository.findIdle();

    }

    //----------------------------------------------------------
    // Statistik
    //----------------------------------------------------------

    async stats() {

        return this.repository.stats();

    }

}

module.exports = QueueService;