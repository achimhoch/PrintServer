"use strict";

const { EventEmitter } = require("events");

class EventBus extends EventEmitter {

    constructor() {

        super();

        //
        // Unbegrenzte Anzahl Listener
        //
        this.setMaxListeners(0);

    }

    //----------------------------------------------------------
    // Event veröffentlichen
    //----------------------------------------------------------

    publish(event, payload = {}) {

        try {

            this.emit(event, payload);

            //
            // Optionaler Wildcard-Event
            //
            this.emit("*", {

                event,

                payload,

                timestamp: new Date()

            });

        }
        catch (err) {

            console.error(

                `[EventBus] Fehler bei Event '${event}'`,

                err

            );

        }

    }

    //----------------------------------------------------------
    // Einmal abonnieren
    //----------------------------------------------------------

    subscribeOnce(event, listener) {

        this.once(event, listener);

    }

    //----------------------------------------------------------
    // Dauerhaft abonnieren
    //----------------------------------------------------------

    subscribe(event, listener) {

        this.on(event, listener);

    }

    //----------------------------------------------------------
    // Abmelden
    //----------------------------------------------------------

    unsubscribe(event, listener) {

        this.off(event, listener);

    }

    //----------------------------------------------------------
    // Alle Listener entfernen
    //----------------------------------------------------------

    clear(event) {

        if (event) {

            this.removeAllListeners(event);

        }
        else {

            this.removeAllListeners();

        }

    }

    //----------------------------------------------------------
    // Listener zählen
    //----------------------------------------------------------

    listenersOf(event) {

        return this.listeners(event);

    }

    //----------------------------------------------------------
    // Statistik
    //----------------------------------------------------------

    stats() {

        const names = this.eventNames();

        return {

            events: names,

            count: names.length,

            listeners: names.reduce(

                (result, name) => {

                    result[name] = this.listenerCount(name);

                    return result;

                },

                {}

            )

        };

    }

}

module.exports = new EventBus();