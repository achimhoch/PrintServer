"use strict";

class PrinterView {

    constructor() {

        this.printers = new Map();

        this.table = document.querySelector(

            "#printerTable tbody"

        );

        this.socket = io();

        this.initialize();

    }

    //----------------------------------------------------------
    // Initialisieren
    //----------------------------------------------------------

    async initialize() {

        await this.load();

        this.registerSocketEvents();

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

        printers.forEach(

            printer => {

                this.printers.set(

                    printer.id,

                    printer

                );

                this.addRow(

                    printer

                );

            }

        );

    }

    //----------------------------------------------------------
    // Socket Events
    //----------------------------------------------------------

    registerSocketEvents() {

        //------------------------------------------------------

        this.socket.on(

            "printer.created",

            printer => {

                this.createPrinter(

                    printer

                );

            }

        );

        //------------------------------------------------------

        this.socket.on(

            "printer.updated",

            printer => {

                this.updatePrinter(

                    printer

                );

            }

        );

        //------------------------------------------------------

        this.socket.on(

            "printer.deleted",

            printer => {

                this.removePrinter(

                    printer.id

                );

            }

        );

    }

    //----------------------------------------------------------
    // Neue Tabellenzeile
    //----------------------------------------------------------

    addRow(printer) {

        const row = document.createElement(

            "tr"

        );

        row.id =

            "printer-" +

            printer.id;

        row.innerHTML = this.rowHtml(

            printer

        );

        this.table.appendChild(

            row

        );

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

`;

    }

    //----------------------------------------------------------
    // Neuer Drucker
    //----------------------------------------------------------

    createPrinter(printer) {

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

        this.addRow(

            printer

        );

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

    }

}

document.addEventListener(

    "DOMContentLoaded",

    () => {

        new PrinterView();

    }

);