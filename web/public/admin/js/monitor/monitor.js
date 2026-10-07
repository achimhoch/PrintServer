"use strict";

class MonitorView {

    constructor() {

        this.socket = io();

        this.initialize();

    }

    //----------------------------------------------------------
    // Initialisieren
    //----------------------------------------------------------

    async initialize() {

        this.registerEvents();

        await this.load();

    }

    //----------------------------------------------------------
    // API
    //----------------------------------------------------------

    async load() {

        try {

            const response =
                await fetch(
                    "/api/monitor/overview"
                );

            const result =
                await response.json();

            if (!result.success)
                return;

            this.renderOverview(
                result.data
            );

            await this.loadPrinters();

        }
        catch (err) {

            console.error(
                "Monitor:",
                err
            );

        }

    }

    //----------------------------------------------------------
    // Drucker laden
    //----------------------------------------------------------

    async loadPrinters() {

        const response =
            await fetch(
                "/api/monitor/printers"
            );

        const result =
            await response.json();

        if (!result.success)
            return;

        this.renderPrinters(
            result.data
        );

    }

    //----------------------------------------------------------
    // Socket Events
    //----------------------------------------------------------

    registerEvents() {

        this.socket.on(
            "monitorTick",
            payload => {

                this.lastTick =
                    payload.timestamp;

                this.updateLastTick();

                this.load();

            }
        );


        this.socket.on(
            "printerStatusChanged",
            printer => {

                this.load();

            }
        );


        this.socket.on(
            "printerUpdated",
            printer => {

                this.loadPrinters();

            }
        );


        this.socket.on(
            "driverError",
            error => {

                this.load();

            }
        );

    }

    //----------------------------------------------------------
    // Übersicht
    //----------------------------------------------------------

    renderOverview(data) {

        const monitor =
            data.monitor;

        const printers =
            data.printers;

        document
            .getElementById(
                "printerCount"
            )
            .textContent =
                printers.total;


        document
            .getElementById(
                "onlineCount"
            )
            .textContent =
                printers.online;


        document
            .getElementById(
                "offlineCount"
            )
            .textContent =
                printers.offline;


        document
            .getElementById(
                "errorCount"
            )
            .textContent =
                printers.errors;


        document
            .getElementById(
                "monitorInterval"
            )
            .textContent =
                `${monitor.interval} ms`;


        const status =
            document.getElementById(
                "monitorStatus"
            );

        if (monitor.running) {

            status.textContent =
                "Läuft";

            status.className =
                "badge bg-success";

        }
        else {

            status.textContent =
                "Gestoppt";

            status.className =
                "badge bg-danger";

        }

    }

    //----------------------------------------------------------
    // Drucker
    //----------------------------------------------------------

    renderPrinters(printers) {

        const tbody =
            document.querySelector(
                "#monitorPrinterTable tbody"
            );

        tbody.innerHTML = "";

        for (const printer of printers) {

            const row =
                document.createElement("tr");

            row.innerHTML = `

                <td>
                    ${this.escape(
                        printer.name
                    )}
                </td>

                <td>
                    ${this.escape(
                        printer.ip || ""
                    )}
                </td>

                <td>
                    ${this.statusBadge(
                        printer.status
                    )}
                </td>

                <td>
                    ${this.escape(
                        printer.driver || "-"
                    )}
                </td>

                <td>
                    ${this.formatDate(
                        printer.lastUpdate
                    )}
                </td>

            `;

            tbody.appendChild(row);

        }

    }

    //----------------------------------------------------------
    // Status
    //----------------------------------------------------------

    statusBadge(status) {

        const value =
            String(
                status || "UNKNOWN"
            ).toUpperCase();

        let css =
            "bg-secondary";

        if (
            value === "ONLINE" ||
            value === "IDLE"
        ) {

            css = "bg-success";

        }
        else if (
            value === "PRINTING"
        ) {

            css = "bg-primary";

        }
        else if (
            value === "OFFLINE"
        ) {

            css = "bg-danger";

        }
        else if (
            value === "ERROR" ||
            value === "STOPPED"
        ) {

            css = "bg-warning text-dark";

        }

        return `
            <span class="badge ${css}">
                ${this.escape(value)}
            </span>
        `;

    }

    //----------------------------------------------------------
    // Start
    //----------------------------------------------------------

    async start() {

        await fetch(
            "/api/monitor/start",
            {
                method: "POST"
            }
        );

        await this.load();

    }

    //----------------------------------------------------------
    // Stop
    //----------------------------------------------------------

    async stop() {

        await fetch(
            "/api/monitor/stop",
            {
                method: "POST"
            }
        );

        await this.load();

    }

    //----------------------------------------------------------
    // Tick
    //----------------------------------------------------------

    async tick() {

        await fetch(
            "/api/monitor/tick",
            {
                method: "POST"
            }
        );

        await this.load();

    }

    //----------------------------------------------------------
    // Zeit
    //----------------------------------------------------------

    updateLastTick() {

        const element =
            document.getElementById(
                "lastTick"
            );

        element.textContent =
            this.formatDate(
                this.lastTick
            );

    }

    formatDate(value) {

        if (!value)
            return "-";

        return new Date(value)
            .toLocaleString("de-DE");

    }

    //----------------------------------------------------------
    // XSS-Schutz
    //----------------------------------------------------------

    escape(value) {

        return String(
            value ?? ""
        )
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

    }

}


//--------------------------------------------------------------
// Start
//--------------------------------------------------------------

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const monitor =
            new MonitorView();

        document
            .getElementById(
                "startButton"
            )
            .addEventListener(
                "click",
                () => monitor.start()
            );

        document
            .getElementById(
                "stopButton"
            )
            .addEventListener(
                "click",
                () => monitor.stop()
            );

        document
            .getElementById(
                "tickButton"
            )
            .addEventListener(
                "click",
                () => monitor.tick()
            );

    }
);