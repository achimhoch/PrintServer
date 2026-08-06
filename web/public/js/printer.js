"use strict";

class Printers {

    constructor() {

        this.printers = new Map();
        this.filteredprinters = [];
        this.table = document.querySelector("#printerTable tbody");
        this.socket = io();
        this.page = 1;
        this.pageSize = 25;
        this.sortColumn = "name";
        this.sortDirection = "DESC";
        this.initialize();

    }

    //----------------------------------------------------------
    // Initialisieren
    //----------------------------------------------------------

    async initialize() {

        await this.load();

        this.registerSocketEvents();
        this.registerEvents();

    }

    //----------------------------------------------------------
    // Drucker laden
    //----------------------------------------------------------

    async load() {

        const response = await fetch(

            "/api/printers"

        );

        const printers = await response.json();

        this.printers.clear();

        this.table.innerHTML = "";

        printers.forEach(printer => {

            this.printers.set(printer.id, printer); 

                /*this.addRow(

                    printer

                );*/

        });

        this.render();

    }

    //----------------------------------------------------------
    //Events
    //----------------------------------------------------------

    registerEvents() {
        const pageSize = document.getElementById("pageSize");

        if (pageSize) {
            pageSize.addEventListener("change", e => {
                this.pageSize = Number(e.target.value);
                this.page = 1;
                this.render();
            });
        }
    }

    //----------------------------------------------------------
    // Socket Events
    //----------------------------------------------------------

    registerSocketEvents() {

        //------------------------------------------------------

        this.socket.on("printer.created", printer => {
            this.printers.set(printer.id, printer);
            this.render();
        });

        //------------------------------------------------------

        this.socket.on("printer.updated", printer => {
            this.printers.set(printer.id, printer);
            this.render();
        });

        //------------------------------------------------------

        this.socket.on("printer.deleted", printer => {
            this.printers.delete(printer.id);
            this.render();
        });

    }

    //----------------------------------------------------------
    //Render
    //----------------------------------------------------------
    render() {
        this.filteredprinters = [...this.printers.values()];
        this.sort()
        this.renderPage();
        this.renderPagination();    
    }

    //----------------------------------------------------------
    //sortieren
    //----------------------------------------------------------

    sort() {
        this.filteredprinters.sort((a, b) => {
            let x = a[this.sortColumn] || "";
            let y = b[this.sortColumn] || "";

            x = x.toString().toLowerCase();
            y = y.toString().toLowerCase();

            if (x < y) 
                return this.sortDirection === "DESC" ? -1 : 1;

            if (x > y)
                return this.sortDirection === "DESC" ? 1 : -1;

            return 0;
        });
    }

    //----------------------------------------------------------
    //Seite rendern
    //----------------------------------------------------------

    renderPage() {
        this.table.innerHTML = ""

        const start = (this.page - 1) * this.pageSize;
        const end = start + this.pageSize;
        const page = this.filteredprinters.slice(start, end);

        page.forEach(printer => this.addRow(printer));

        const count = document.getElementById("printerCount");

        if (count) {
            count.innerHTML = `${this.filteredprinters.length} Drucker`;
        }
    }

    //----------------------------------------------------------
    //render Pagination
    //----------------------------------------------------------

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
                this.renderPage();
                this.renderPagination();
            };

            pagination.appendChild(li);
        }
    }

    //----------------------------------------------------------
    // Neue Tabellenzeile
    //----------------------------------------------------------

    addRow(printer) {

        const row = document.createElement("tr");
        row.id = "printer-" + printer.id;
        row.innerHTML = this.rowHtml(printer);

        this.table.appendChild(row);

    }

    //----------------------------------------------------------
    // HTML einer Zeile
    //----------------------------------------------------------

    rowHtml(printer) {

        return `

                <td>${printer.name}</td> 

                <td>${printer.ip}</td>

                <td>${printer.location || ""}</td>

                <td>${printer.status || ""}</td>

                <td>

                <span class="badge ${printer.online ? "bg-success" : "bg-danger"}">

                ${printer.online ? "Online" : "Offline"}

                </span>

                </td>

                <td>

                <span class="badge ${printer.color ? "bg-primary" : "bg-secondary"}">

                ${printer.color ? "Ja" : "Nein"}

                </span>

                </td>

                <td>

                <span class="badge ${printer.duplex ? "bg-primary" : "bg-secondary"}">

                ${printer.duplex ? "Ja" : "Nein"}

                </span>

                </td>
                <td>
                <a href="/printer/${printer.id}">View</a>
                </td>

        `;

    }

    //----------------------------------------------------------
    // Neuer Drucker
    //----------------------------------------------------------

    /*createPrinter(printer) {

        if (

            this.printers.has(

                printer.id

            )

        )

            return;

        this.printers.set(

            printer.id,

            printer

        );

        /*this.addRow(

            printer

        );
        this.render();

    }

    //----------------------------------------------------------
    // Drucker aktualisieren
    //----------------------------------------------------------

    updatePrinter(printer) {

        this.printers.set(

            printer.id,

            printer

        );

        const row = document.getElementById(

            "printer-" +

            printer.id

        );

        if (!row) {

            this.addRow(

                printer

            );

            return;

        }

        row.innerHTML =

            this.rowHtml(

                printer

            );

    }

    //----------------------------------------------------------
    // Drucker entfernen
    //----------------------------------------------------------

    removePrinter(id) {

        this.printers.delete(id);

        const row = document.getElementById(

            "printer-" +

            id

        );

        if (row)

            row.remove();

    }*/

}

document.addEventListener(

    "DOMContentLoaded",

    () => {

        new Printers();

    }

);