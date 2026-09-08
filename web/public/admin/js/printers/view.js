"use strict";

class PrinterView {

    constructor() {

        this.table = document.querySelector("#printerTable"); 
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
        const data = document.getElementById("data");
        const id = data.dataset.id;
        //console.log(id);
        const response = await fetch(`/api/printers/${id}`); 
        //console.log(response);
        const printer = await response.json();
        //console.log(printer);

        this.table.innerHTML = "";

       this.addRow(printer);

       

    }

   


    //----------------------------------------------------------
    // Neue Tabellenzeile
    //----------------------------------------------------------

    addRow(printer) {
        console.log(printer);

            //console.log(`${detail}`);
            const row = document.createElement("tr");
            this.table.innerHTML = this.rowHtml(printer);
             //this.table.appendChild(row);
      
       

    }

    //----------------------------------------------------------
    // HTML einer Zeile
    //----------------------------------------------------------

    rowHtml(printer) {

        return `

              
                <tr>
                    <th>ID:</th>
                    <td>${printer.id}</td>
                </tr>
                <tr>
                    <th>Name:</th>
                    <td>${printer.name} </td>
                </tr>
                 <tr>
                    <th>Hersteller/Model:</th>
                    <td>${printer.model} </td>
                </tr>
                <tr>
                    <th>IP:</th>
                    <td>${printer.ip} </td>
                </tr>
                <tr>
                    <th>Url:</th>
                    <td>${printer.uri} </td>
                </tr>
                <tr>
                    <th>Ort:</th>
                    <td>${printer.location} </td>
                </tr>
                <tr>
                    <th>Online: </th>    
                    <td><span class="badge ${printer.online ? "bg-success" : "bg-danger"}">${printer.online ? "Online" : "Offline"}</span></td>
                </tr>
                <tr>
                    <th>Farbe:</th>
                    <td><span class="badge ${printer.color ? "bg-primary" : "bg-secondary"}">${printer.color ? "Ja" : "Nein"}</span></td>
                </tr>
                <tr>
                    <th>Duplex:</th>
                    <td><span class="badge ${printer.duplex ? "bg-primary" : "bg-secondary"}">${printer.duplex ? "Ja" : "Nein"}</span></td>
                </tr>
           

        `;

    }

    

}

document.addEventListener(

    "DOMContentLoaded",

    () => {

        new PrinterView();

    }

);