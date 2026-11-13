"use strict";
const SequelizeRepository = require("./SequelizeRepository");

class PrintAppRepository extends SequelizeRepository {
    async findByClientId(clientId) {
        return this.findOne({ clientId });
    }
    async findByKeyHash(apiKeyHash) {
        return this.findOne({ apiKeyHash, enabled: true, revokedAt: null });
    }
    async list() {
        return this.findAll({ order: [["createdAt", "DESC"]] });
    }
    async markAllOffline() {
        return this.model.update({ status: "offline" }, { where: { status: "online" } });
    }
    async getAssignment(client) {
        const users = this.model.sequelize.models.User;
        const queues = this.model.sequelize.models.Queue;
        const printers = this.model.sequelize.models.Printer;
        const queuePrinters = this.model.sequelize.models.QueuePrinter;
        const user = await users.findByPk(client.userId, { attributes: ["id", "username", "queueId"] });
        const queueId = client.queueId || user?.queueId || null;
        const queue = queueId ? await queues.findByPk(queueId) : null;
        let assignedPrinters = [];
        if (queueId) {
            const links = await queuePrinters.findAll({ where: { queueId }, attributes: ["printerId"] });
            const ids = links.map(x => x.printerId);
            if (ids.length) assignedPrinters = await printers.findAll({ where: { id: ids } });
        }
        return { user, queue, printers: assignedPrinters };
    }
}
module.exports = PrintAppRepository;