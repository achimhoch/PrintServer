"use strict";

class MonitorView {

    constructor() {

        this.socket = io();
        this.filteredprinters = [];
        this.printers = new Map();
        this.page = 1;
        this.pageSize = 20;

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
            //console.log(response);

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

        const result = await response.json();
            //console.log(result);
        if (!result.success)
            return;

        this.printers.clear();

        result.data.forEach(printer => {
            this.printers.set(printer.id, printer);
        });

        //this.render(result.data);
        this.render();

    }
     
    //-----Render-----------------------------------------------
    render() {
        this.filteredprinters = [...this.printers.values()];
        this.renderPrinters();
        this.renderPagination();
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

        const monitor = data.monitor;
        //console.log(monitor);
        const printers = data.printers;
        document.getElementById("printerCount").textContent = printers.total;
        document.getElementById("onlineCount").textContent = printers.online;
        document.getElementById("offlineCount").textContent = printers.offline;
        document.getElementById("errorCount").textContent = printers.errors;
        document.getElementById("lastTick").textContent = this.formatDate(monitor.statistics.lastRun);  
        document.getElementById("monitorInterval").textContent = `${monitor.interval} ms`;  

        const status = document.getElementById("monitorStatus");

        if (monitor.running) {

            status.textContent = "Läuft";

            status.className = "badge bg-success";

        }
        else {

            status.textContent = "Gestoppt";

            status.className = "badge bg-danger";

        }

    }

    //----------------------------------------------------------
    // Drucker
    //----------------------------------------------------------

    renderPrinters() {



        const tbody = document.querySelector("#monitorPrinterTable tbody");

        tbody.innerHTML = "";

        const start = (this.page - 1) * this.pageSize;
        const end = start + this.pageSize;
        const page = this.filteredprinters.slice(start, end);

        for (const printer of page) {
            //console.log(printer);
            const row = document.createElement("tr"); 

            row.innerHTML = `

                <td>${this.escape(printer.name)}</td>
                <td>${this.escape(printer.ip || "")}</td>
                <td>${this.statusBadge(printer.status)}</td>
                <td>${this.escape(printer.driver || printer.protocol || "-")}</td>
                <td>${this.formatDate(printer.lastUpdate)}</td>

            `;

            tbody.appendChild(row);

        }

        const count = document.getElementById("pCount"); 
        //console.log(count);
        if (count) {
            count.innerHTML = `${this.filteredprinters.length} Drucker`;
        }
        //console.log(this.filteredprinters.length);

    }

    //--Pagination------------------------------------------------

    renderPagination() {
        const pagination = document.getElementById("pagination");

        if (!pagination)
            return;

        pagination.innerHTML = "";
        const pages = Math.ceil(this.filteredprinters.length / this.pageSize); 
        for (let page = 1; page <= pages; page++) {
            const li = document.createElement("li");
            li.className = "page-item" + (page === this.page ? " active" : "");
            li.innerHTML = `<a class="page-link" href="#">${page}</a>`;
            li.onclick = e => {
                e.preventDefault();
                this.page = page;
                this.renderPrinters();
                this.renderPagination();
            };

            pagination.appendChild(li);
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