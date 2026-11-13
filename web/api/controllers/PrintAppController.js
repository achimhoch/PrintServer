"use strict";
class PrintAppController {
    constructor(bootstrap) { this.manager = bootstrap.printAppManager; }
    async list(req, res) {
        const clients = await this.manager.list();
        res.json({ success: true, data: clients });
    }
    async get(req, res) {
        const client = await this.manager.get(req.params.id);
        if (!client) return res.status(404).json({ success: false, message: "PrintApp nicht gefunden" });
        res.json({ success: true, data: client });
    }
    async create(req, res) {
        try {
            const result = await this.manager.create(req.body || {});
            res.status(201).json({
                success: true, data: result.client,
                apiKey: result.apiKey,
                warning: "Der API-Key wird nur einmal angezeigt. Jetzt sicher speichern."
            });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    async updateAssignment(req, res) {
        try {
            const client = await this.manager.updateAssignment(req.params.id, req.body || {});
            if (!client) return res.status(404).json({ success: false, message: "PrintApp nicht gefunden" });
            res.json({ success: true, data: client });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
    async revoke(req, res) {
        const ok = await this.manager.revoke(req.params.id);
        if (!ok) return res.status(404).json({ success: false, message: "PrintApp nicht gefunden" });
        res.json({ success: true });
    }
    async enable(req, res) {
        const result = await this.manager.enable(req.params.id);
        if (!result) return res.status(404).json({ success: false, message: "PrintApp nicht gefunden" });
        res.json({
            success: true, data: result.client, apiKey: result.apiKey,
            warning: "Neuer API-Key – der bisherige Schlüssel bleibt widerrufen."
        });
    }
}
module.exports = PrintAppController;