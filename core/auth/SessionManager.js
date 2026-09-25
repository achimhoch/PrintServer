"use strict";

const crypto = require("crypto");

class SessionManager {

    constructor(options = {}) {

        this.sessions =
            new Map();

        this.duration =
            options.duration ||
            8 * 60 * 60 * 1000;

        this.cookieName =
            options.cookieName ||
            "printserver.sid";

    }

    // ---------------------------------------------------------
    // Session erzeugen
    // ---------------------------------------------------------

    create(user) {

        const id =
            crypto.randomBytes(32)
                .toString("hex");

        const now =
            Date.now();

        const session = {

            id,

            user,

            createdAt:
                new Date(now),

            lastAccess:
                new Date(now),

            expiresAt:
                new Date(
                    now + this.duration
                )

        };

        this.sessions.set(
            id,
            session
        );

        return session;

    }

    // ---------------------------------------------------------
    // Session lesen
    // ---------------------------------------------------------

    get(id) {

        if (!id) {
            return null;
        }

        const session =
            this.sessions.get(id);

        if (!session) {
            return null;
        }

        if (
            session.expiresAt.getTime()
            <= Date.now()
        ) {

            this.destroy(id);

            return null;

        }

        session.lastAccess =
            new Date();

        return session;

    }

    // ---------------------------------------------------------
    // Session verlängern
    // ---------------------------------------------------------

    touch(id) {

        const session =
            this.get(id);

        if (!session) {
            return null;
        }

        session.lastAccess =
            new Date();

        session.expiresAt =
            new Date(
                Date.now() +
                this.duration
            );

        return session;

    }

    // ---------------------------------------------------------
    // Session löschen
    // ---------------------------------------------------------

    destroy(id) {

        if (!id) {
            return false;
        }

        return this.sessions.delete(id);

    }

    // ---------------------------------------------------------
    // Alle Sessions bereinigen
    // ---------------------------------------------------------

    cleanup() {

        const now =
            Date.now();

        for (
            const [id, session]
            of this.sessions
        ) {

            if (
                session.expiresAt.getTime()
                <= now
            ) {

                this.sessions.delete(id);

            }

        }

    }

    // ---------------------------------------------------------
    // Benutzer anhand Session
    // ---------------------------------------------------------

    getUser(id) {

        const session =
            this.get(id);

        return session
            ? session.user
            : null;

    }

}

module.exports = SessionManager;
