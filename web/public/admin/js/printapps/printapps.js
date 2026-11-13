(() => {
  const api = "/api/printapps";
  const tbody = document.querySelector("#printAppTable tbody");
  const form = document.getElementById("createPrintAppForm");
  const message = document.getElementById("formMessage");
  const keyBox = document.getElementById("newApiKey");

  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
  const date = value => value ? new Date(value).toLocaleString() : "–";

  async function load() {
    const response = await fetch(api, { credentials: "same-origin" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = await response.json();
    tbody.innerHTML = (result.data || []).map(c => `
      <tr data-id="${esc(c.id)}">
        <td>${esc(c.name)}<br><small>${esc(c.hostname || c.clientId)}</small></td>
        <td>${esc(c.username || c.userId)}</td>
        <td>${esc(c.queueName || c.queueId || "–")}</td>
        <td>${esc((c.printerNames || []).join(", ") || "–")}</td>
        <td><span class="badge ${c.status === "online" ? "bg-success" : "bg-secondary"}">${esc(c.status)}</span></td>
        <td>${esc(c.version || "–")}</td>
        <td>${esc(date(c.lastSeen))}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary" data-assign="${esc(c.id)}" data-user="${esc(c.userId)}" data-queue="${esc(c.queueId || "")}">Zuordnung</button>
          ${c.enabled
            ? `<button class="btn btn-sm btn-outline-danger" data-revoke="${esc(c.id)}">Widerrufen</button>`
            : `<button class="btn btn-sm btn-outline-success" data-enable="${esc(c.id)}">Aktivieren</button>`}
        </td>
      </tr>`).join("");
  }

  form.addEventListener("submit", async event => {
    event.preventDefault();
    message.textContent = "Client wird angelegt …";
    keyBox.hidden = true;
    const data = Object.fromEntries(new FormData(form).entries());
    if (data.queueId) data.queueId = Number(data.queueId); else delete data.queueId;
    try {
      const response = await fetch(api, {
        method: "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || `HTTP ${response.status}`);
      keyBox.textContent = `API-Key (wird nur einmal angezeigt): ${result.apiKey}`;
      keyBox.hidden = false;
      message.textContent = "Client wurde angelegt. API-Key jetzt in der WinUI-App hinterlegen.";
      form.reset();
      await load();
    } catch (error) { message.textContent = error.message; }
  });

  tbody.addEventListener("click", async event => {
    const assign = event.target.dataset.assign;
    if (assign) {
      const userId = prompt("Neue Benutzer-ID (users.id):", event.target.dataset.user || "");
      if (userId === null || !userId.trim()) return;
      const queueId = prompt("Queue-ID (leer = Benutzer-Standardqueue):", event.target.dataset.queue || "");
      if (queueId === null) return;
      const payload = { userId: userId.trim(), queueId: queueId.trim() ? Number(queueId) : null };
      const response = await fetch(`${api}/${assign}/assignment`, {
        method: "PUT", credentials: "same-origin",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) alert(result.message || "Zuordnung fehlgeschlagen");
      await load();
      return;
    }

    const revoke = event.target.dataset.revoke;
    const enable = event.target.dataset.enable;
    const id = revoke || enable;
    if (!id) return;
    const action = revoke ? "revoke" : "enable";
    if (revoke && !confirm("API-Key dieses Clients wirklich widerrufen?")) return;
    const response = await fetch(`${api}/${id}/${action}`, { method: "POST", credentials: "same-origin" });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) alert(result.message || "Aktion fehlgeschlagen");
    if (result.apiKey) {
      keyBox.textContent = `Neuer API-Key (wird nur einmal angezeigt): ${result.apiKey}`;
      keyBox.hidden = false;
    }
    await load();
  });

  try {
    const socket = io();
    socket.on("printapp.status", () => load().catch(console.error));
    socket.on("printapp.configuration.changed", () => load().catch(console.error));
    socket.on("printapp.revoked", () => load().catch(console.error));
  } catch (error) { console.warn("Live-Status nicht verfügbar", error); }

  load().catch(error => { message.textContent = `Laden fehlgeschlagen: ${error.message}`; });
  setInterval(() => load().catch(console.error), 30000);
})();