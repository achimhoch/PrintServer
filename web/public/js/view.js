"use strict";

class PrinterView {

    constructor() {

        this.view = document.querySelector("#printerview");
        //this.socket = io();
       
        this.initialize();

    }

    //----------------------------------------------------------
    // Initialisieren
    //----------------------------------------------------------

    async initialize() {

        await this.load();

        

    }

    //----------------------------------------------------------
    // Drucker laden
    //----------------------------------------------------------

    async load() {
        const script = document.currentScript;
        const Url = new URL(script.src);
        const id = Url.searchParams.get("id");
        const response = await fetch(`/api/printers/${id}`); 
        console.log(response);
        const printer = await response.json();


        this.view.innerHTML = "";

       this.addRow(printer);

       

    }

   


    //----------------------------------------------------------
    // Neue Tabellenzeile
    //----------------------------------------------------------

    addRow(printer) {

       
        this.view.innerHTML = this.rowHtml(printer);

        //this.table.appendChild(row);

    }

    //----------------------------------------------------------
    // HTML einer Zeile
    //----------------------------------------------------------

    rowHtml(printer) {

        return `

               <h2>${printer.name}</h2>
            <table class="table table-striped" id="printerTable"> 
                <tr>
                    <td>ID:</td>
                    <td><%= printer.id %></td>
                </tr>
                <tr>
                    <td>Name:</td>
                    <td><%= printer.name %> </td>
                </tr>
                 <tr>
                    <td>Hersteller/Model:</td>
                    <td><%= printer.model %> </td>
                </tr>
                <tr>
                    <td>IP:</td>
                    <td><%= printer.ip %> </td>
                </tr>
                <tr>
                    <td>Url:</td>
                    <td><%= printer.uri %> </td>
                </tr>
                <tr>
                    <td>Ort:</td>
                    <td><%= printer.location %> </td>
                </tr>
                <tr>
                    <td>Farbe:</td>
                    <td><%= printer.model ? "ja" : "Nein" %> </td>
                </tr>
                <tr>
                    <td>Duplex:</td>
                    <td><%= printer.model ? "ja" : "Nein" %> </td>
                </tr>
            </table>
            <a href="/printer">zurück</a>

        `;

    }

    

}

document.addEventListener(

    "DOMContentLoaded",

    () => {

        new PrinterView();

    }

);