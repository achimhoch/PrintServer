"use strict";

const { EventEmitter } = require("events");

class EventBus extends EventEmitter {

    constructor() {

        super();

        // verhindert Warnungen bei vielen Listenern
        this.setMaxListeners(100);

    }

    /**
     * Event senden
     */
    publish(event, payload = {}) { 

        this.emit(event, payload);

    }

    /**
     * Alias für publish()
     */
    broadcast(event, payload = {}) {

        this.emit(event, payload);

    }

    /**
     * Einmal auf Event warten
     */
    onceEvent(event) {

        return new Promise(resolve => {

            this.once(event, resolve);

        });

    }

    /**
     * Entfernt alle Listener
     */
    clear() {

        this.removeAllListeners();

    }

    /**
     * Anzahl der Listener eines Events
     */
    count(event) {

        return this.listenerCount(event);

    }

    /**
     * Registrierte Events
     */
    events() {

        return this.eventNames();

    }

    /**
     * Debug-Ausgabe
     */
    dump() {

        console.log("====== EventBus ======");

        for (const event of this.eventNames()) {

            console.log(
                `${event} (${this.listenerCount(event)} Listener)`
            );

        }

        console.log("======================");

    }

}

module.exports = new EventBus();