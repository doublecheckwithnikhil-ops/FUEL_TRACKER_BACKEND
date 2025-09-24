"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listDrivers = listDrivers;
exports.listVehicles = listVehicles;
exports.listPetroCards = listPetroCards;
exports.assignVehicle = assignVehicle;
exports.deassignVehicle = deassignVehicle;
exports.assignCard = assignCard;
exports.deassignCard = deassignCard;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const DRIVER_ROLE_ID = 2;
/** GET /api/admin/drivers?search= */
async function listDrivers(req, res) {
    const search = req.query.search?.trim() ?? "";
    const where = {
        roleId: DRIVER_ROLE_ID,
        ...(search && {
            OR: [
                { name: { contains: search } },
                { empCode: { contains: search } },
                { storeCode: { contains: search } },
            ],
        }),
    };
    const drivers = await prisma.user.findMany({
        where,
        select: { id: true, name: true, empCode: true, storeCode: true },
        take: 50,
        orderBy: { id: "desc" },
    });
    res.json({ drivers });
}
/** GET /api/admin/vehicles?available=true&search= */
async function listVehicles(req, res) {
    const search = req.query.search?.trim() ?? "";
    const available = String(req.query.available ?? "").toLowerCase() === "true";
    const where = {
        ...(available ? { assignedDriverId: null } : {}),
        ...(search ? { vehicleNumber: { contains: search, mode: "insensitive" } } : {}),
    };
    const vehicles = await prisma.vehicle.findMany({
        where,
        select: { id: true, vehicleNumber: true, assignedDriverId: true },
        orderBy: { id: "desc" },
        take: 200,
    });
    res.json({ vehicles });
}
/** GET /api/admin/petrocards?available=true&search= */
async function listPetroCards(req, res) {
    const search = req.query.search?.trim() ?? "";
    const available = String(req.query.available ?? "").toLowerCase() === "true";
    const where = {
        ...(available ? { issuedToDriverId: null } : {}),
        ...(search ? { cardNumber: { contains: search, mode: "insensitive" } } : {}),
    };
    const cards = await prisma.petroCard.findMany({
        where,
        select: { id: true, cardNumber: true, validTill: true, issuedToDriverId: true },
        orderBy: { id: "desc" },
        take: 200,
    });
    res.json({ cards });
}
/** POST /api/admin/assignments/vehicle  { vehicleId, userId } */
async function assignVehicle(req, res) {
    const vehicleId = Number(req.body.vehicleId);
    const userId = Number(req.body.userId);
    if (!vehicleId || !userId)
        return res.status(400).json({ message: "vehicleId and userId are required" });
    const driver = await prisma.user.findUnique({ where: { id: userId } });
    if (!driver || driver.roleId !== DRIVER_ROLE_ID) {
        return res.status(400).json({ message: "User must be a driver." });
    }
    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle)
        return res.status(404).json({ message: "Vehicle not found." });
    if (vehicle.assignedDriverId && vehicle.assignedDriverId !== userId) {
        return res.status(409).json({ message: "Vehicle already assigned to another driver." });
    }
    const updated = await prisma.vehicle.update({
        where: { id: vehicleId },
        data: { assignedDriverId: userId },
    });
    res.json({ message: "Vehicle assigned.", vehicle: updated });
}
/** DELETE /api/admin/assignments/vehicle/:vehicleId */
async function deassignVehicle(req, res) {
    const vehicleId = Number(req.params.vehicleId);
    if (!vehicleId)
        return res.status(400).json({ message: "vehicleId required" });
    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle)
        return res.status(404).json({ message: "Vehicle not found." });
    if (!vehicle.assignedDriverId) {
        return res.json({ message: "Vehicle already available.", vehicle });
    }
    const updated = await prisma.vehicle.update({
        where: { id: vehicleId },
        data: { assignedDriverId: null },
    });
    res.json({ message: "Vehicle de-assigned.", vehicle: updated });
}
/** POST /api/admin/assignments/petrocard  { cardId, userId } */
async function assignCard(req, res) {
    const cardId = Number(req.body.cardId);
    const userId = Number(req.body.userId);
    if (!cardId || !userId)
        return res.status(400).json({ message: "cardId and userId are required" });
    const driver = await prisma.user.findUnique({ where: { id: userId } });
    if (!driver || driver.roleId !== DRIVER_ROLE_ID) {
        return res.status(400).json({ message: "User must be a driver." });
    }
    const card = await prisma.petroCard.findUnique({ where: { id: cardId } });
    if (!card)
        return res.status(404).json({ message: "Card not found." });
    if (card.issuedToDriverId && card.issuedToDriverId !== userId) {
        return res.status(409).json({ message: "Card already assigned to another driver." });
    }
    const updated = await prisma.petroCard.update({
        where: { id: cardId },
        data: { issuedToDriverId: userId },
    });
    res.json({ message: "Card assigned.", card: updated });
}
/** DELETE /api/admin/assignments/petrocard/:cardId */
async function deassignCard(req, res) {
    const cardId = Number(req.params.cardId);
    if (!cardId)
        return res.status(400).json({ message: "cardId required" });
    const card = await prisma.petroCard.findUnique({ where: { id: cardId } });
    if (!card)
        return res.status(404).json({ message: "Card not found." });
    if (!card.issuedToDriverId) {
        return res.json({ message: "Card already available.", card });
    }
    const updated = await prisma.petroCard.update({
        where: { id: cardId },
        data: { issuedToDriverId: null },
    });
    res.json({ message: "Card de-assigned.", card: updated });
}
//# sourceMappingURL=assignment.controller.js.map