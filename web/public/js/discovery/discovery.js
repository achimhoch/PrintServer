"use strict";


//==========================================================
// Elemente
//==========================================================

const scanButton =
    document.getElementById(
        "btnDiscoveryScan"
    );

const scanSpinner =
    document.getElementById(
        "discoveryScanSpinner"
    );

const scanText =
    document.getElementById(
        "discoveryScanText"
    );

const alertBox =
    document.getElementById(
        "discoveryAlert"
    );


//==========================================================
// Hilfsfunktionen
//==========================================================

function showAlert(
    message,
    type = "info"
) {

    alertBox.className =
        `alert alert-${type}`;

    alertBox.textContent =
        message;

}


function hideAlert() {

    alertBox.className =
        "alert d-none";

    alertBox.textContent =
        "";

}


function formatDate(
    value
) {

    if (!value)
        return "-";

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "-";

    }

    return date.toLocaleString(
        "de-DE"
    );

}


//==========================================================
// Scan Button
//==========================================================

scanButton.addEventListener(
    "click",
    startDiscoveryScan
);


async function startDiscoveryScan() {

    if (
        scanButton.disabled
    ) {

        return;

    }

    hideAlert();

    scanButton.disabled =
        true;

    scanSpinner.classList.remove(
        "d-none"
    );

    scanText.textContent =
        "Scan läuft ...";


    try {

        const response =
            await fetch(
                "/api/discovery/scan",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    }
                }
            );


        const data =
            await response.json();


        //--------------------------------------------------
        // Bereits laufender Scan
        //--------------------------------------------------

        if (
            response.status === 409
        ) {

            showAlert(
                "Ein Discovery-Scan läuft bereits.",
                "warning"
            );

            return;

        }


        //--------------------------------------------------
        // Discovery nicht gestartet
        //--------------------------------------------------

        if (
            response.status === 503
        ) {

            showAlert(
                "Discovery ist momentan nicht gestartet.",
                "danger"
            );

            return;

        }


        //--------------------------------------------------
        // Fehler
        //--------------------------------------------------

        if (!response.ok) {

            throw new Error(
                data?.error?.message ||
                "Discovery-Scan konnte nicht gestartet werden."
            );

        }


        //--------------------------------------------------
        // Erfolgreich gestartet
        //--------------------------------------------------

        showAlert(
            "Discovery-Scan wurde gestartet.",
            "success"
        );


        await loadDiscoveryStatus();

    }
    catch (error) {

        console.error(
            "Discovery scan failed:",
            error
        );

        showAlert(
            error.message,
            "danger"
        );

    }
    finally {

        scanButton.disabled =
            false;

        scanSpinner.classList.add(
            "d-none"
        );

        scanText.textContent =
            "Jetzt scannen";

    }

}


//==========================================================
// Discovery Status
//==========================================================

async function loadDiscoveryStatus() {

    try {

        const response =
            await fetch(
                "/api/discovery/status"
            );


        if (!response.ok) {

            throw new Error(
                "Discovery-Status konnte nicht geladen werden."
            );

        }


        const data =
            await response.json();


        if (
            !data.success
        ) {

            throw new Error(
                data?.error?.message ||
                "Discovery-Status ungültig."
            );

        }


        updateDiscoveryStatus(
            data.discovery
        );

    }
    catch (error) {

        console.error(
            "Discovery status failed:",
            error
        );

    }

}


//==========================================================
// Status aktualisieren
//==========================================================

function updateDiscoveryStatus(
    discovery
) {

    if (!discovery)
        return;


    //------------------------------------------------------
    // Allgemeiner Status
    //------------------------------------------------------

    document.getElementById(
        "discoveryRunning"
    ).textContent =
        discovery.running
            ? "Aktiv"
            : "Gestoppt";


    document.getElementById(
        "discoveryScanning"
    ).textContent =
        discovery.scanning
            ? "Scan läuft"
            : "Bereit";


    document.getElementById(
        "discoveryLastScan"
    ).textContent =
        formatDate(
            discovery.lastScan
        );


    document.getElementById(
        "discoveryNextScan"
    ).textContent =
        formatDate(
            discovery.nextScan
        );


    //------------------------------------------------------
    // Button
    //------------------------------------------------------

    scanButton.disabled =
        discovery.scanning ||
        !discovery.running;


    if (discovery.scanning) {

        scanText.textContent =
            "Scan läuft ...";

        scanSpinner.classList.remove(
            "d-none"
        );

    }
    else {

        scanText.textContent =
            "Jetzt scannen";

        scanSpinner.classList.add(
            "d-none"
        );

    }


    //------------------------------------------------------
    // Provider
    //------------------------------------------------------

    renderProviders(
        discovery.providers || []
    );

}


//==========================================================
// Provider-Tabelle
//==========================================================

function renderProviders(
    providers
) {

    const tbody =
        document.getElementById(
            "discoveryProviders"
        );


    if (
        !providers.length
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="text-center text-muted">

                    Keine Provider registriert.

                </td>

            </tr>

        `;

        return;

    }


    tbody.innerHTML =
        providers.map(
            provider => `

                <tr>

                    <td>
                        <strong>
                            ${escapeHtml(
                                provider.name
                            )}
                        </strong>
                    </td>

                    <td>
                        ${escapeHtml(
                            provider.type || "-"
                        )}
                    </td>

                    <td>

                        ${
                            provider.enabled
                                ? `
                                    <span class="badge text-bg-success">
                                        Ja
                                    </span>
                                  `
                                : `
                                    <span class="badge text-bg-secondary">
                                        Nein
                                    </span>
                                  `
                        }

                    </td>

                    <td>

                        ${
                            provider.running
                                ? `
                                    <span class="badge text-bg-success">
                                        Läuft
                                    </span>
                                  `
                                : `
                                    <span class="badge text-bg-secondary">
                                        Gestoppt
                                    </span>
                                  `
                        }

                    </td>

                    <td>
                        ${provider.scanCount ?? 0}
                    </td>

                    <td>
                        ${provider.discovered ?? 0}
                    </td>

                    <td>
                        ${provider.errors ?? 0}
                    </td>

                </tr>

            `
        )
        .join("");

}


//==========================================================
// HTML escapen
//==========================================================

function escapeHtml(
    value
) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


//==========================================================
// Initialisierung
//==========================================================

loadDiscoveryStatus();


//==========================================================
// Status regelmäßig aktualisieren
//==========================================================

setInterval(
    loadDiscoveryStatus,
    2000
);
