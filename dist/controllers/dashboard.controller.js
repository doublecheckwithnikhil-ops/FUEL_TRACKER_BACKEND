"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecentEntries = exports.getDashboardStats = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getDashboardStats = async (req, res) => {
    try {
        const user = req.user;
        let where = {};
        if (user.role === "driver") {
            where = { driverId: user.id };
        }
        const total = await prisma.fuelEntry.count({ where });
        res.json({ total });
    }
    catch (err) {
        console.error("Error fetching dashboard stats", err);
        res.status(500).json({ message: "Failed to fetch stats" });
    }
};
exports.getDashboardStats = getDashboardStats;
const getRecentEntries = async (req, res) => {
    try {
        const user = req.user;
        let where = {};
        if (user.role === "driver") {
            where = { id: user.id };
        }
        const entries = await prisma.fuelEntry.findMany({
            where,
            orderBy: { createdAt: "desc" },
            take: 5,
            include: {
                driver: true,
                vehicle: true,
                petroCard: true,
            },
        });
        res.json(entries);
    }
    catch (err) {
        console.error("Error fetching recent entries", err);
        res.status(500).json({ message: "Failed to fetch recent entries" });
    }
};
exports.getRecentEntries = getRecentEntries;
//# sourceMappingURL=dashboard.controller.js.map