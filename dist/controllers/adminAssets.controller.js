"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listVehicles = listVehicles;
exports.getVehicle = getVehicle;
exports.createVehicle = createVehicle;
exports.updateVehicle = updateVehicle;
exports.deleteVehicle = deleteVehicle;
exports.listCards = listCards;
exports.getCard = getCard;
exports.createCard = createCard;
exports.updateCard = updateCard;
exports.deleteCard = deleteCard;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/* ---------- VEHICLES ---------- */
async function listVehicles(req, res) {
    const search = String(req.query.search ?? "").trim();
    const page = Math.max(Number(req.query.page ?? 1), 1);
    const pageSize = Math.min(Math.max(Number(req.query.pageSize ?? 20), 1), 100);
    const where = search
        ? { vehicleNumber: { contains: search } } // removed `mode`
        : {};
    const [items, total] = await Promise.all([
        prisma.vehicle.findMany({
            where,
            orderBy: { id: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
            select: {
                id: true,
                vehicleNumber: true,
                fuelType: true,
                modelNumber: true,
                ownType: true,
                owner: true,
                size: true,
                tankSize: true,
                assignedDriverId: true,
            },
        }),
        prisma.vehicle.count({ where }),
    ]);
    res.json({ items, total, page, pageSize });
}
async function getVehicle(req, res) {
    const id = Number(req.params.id);
    const item = await prisma.vehicle.findUnique({
        where: { id },
        select: {
            id: true,
            vehicleNumber: true,
            size: true,
            tankSize: true,
            owner: true,
            ownType: true,
            modelNumber: true,
            fuelType: true,
            assignedDriverId: true,
        },
    });
    if (!item)
        return res.status(404).json({ message: "Vehicle not found" });
    res.json(item);
}
async function createVehicle(req, res) {
    const vehicleNumber = String(req.body.vehicleNumber ?? "").trim();
    if (!vehicleNumber)
        return res.status(400).json({ message: "vehicleNumber is required" });
    try {
        const created = await prisma.vehicle.create({
            data: {
                vehicleNumber,
                size: req.body.size?.toString().trim() || null,
                tankSize: req.body.tankSize?.toString().trim() || null,
                owner: req.body.owner?.toString().trim() || null,
                ownType: req.body.ownType || null,
                modelNumber: req.body.modelNumber?.toString().trim() || null,
                fuelType: req.body.fuelType?.toString().trim() || null,
            },
            select: {
                id: true,
                vehicleNumber: true,
                size: true,
                tankSize: true,
                owner: true,
                ownType: true,
                modelNumber: true,
                fuelType: true,
            },
        });
        res.status(201).json(created);
    }
    catch (e) {
        if (e.code === "P2002")
            return res.status(409).json({ message: "vehicleNumber already exists" });
        throw e;
    }
}
async function updateVehicle(req, res) {
    const id = Number(req.params.id);
    const data = {};
    if (typeof req.body.vehicleNumber === "string" && req.body.vehicleNumber.trim())
        data.vehicleNumber = req.body.vehicleNumber.trim();
    if (req.body.size !== undefined)
        data.size = req.body.size?.toString().trim() || null;
    if (req.body.tankSize !== undefined)
        data.tankSize = req.body.tankSize?.toString().trim() || null;
    if (req.body.owner !== undefined)
        data.owner = req.body.owner?.toString().trim() || null;
    if (req.body.ownType !== undefined)
        data.ownType = req.body.ownType || null;
    if (req.body.modelNumber !== undefined)
        data.modelNumber = req.body.modelNumber?.toString().trim() || null;
    if (req.body.fuelType !== undefined)
        data.fuelType = req.body.fuelType?.toString().trim() || null;
    try {
        const updated = await prisma.vehicle.update({
            where: { id },
            data,
            select: {
                id: true,
                vehicleNumber: true,
                size: true,
                tankSize: true,
                owner: true,
                ownType: true,
                modelNumber: true,
                fuelType: true,
                assignedDriverId: true,
            },
        });
        res.json(updated);
    }
    catch (e) {
        if (e.code === "P2025")
            return res.status(404).json({ message: "Vehicle not found" });
        if (e.code === "P2002")
            return res.status(409).json({ message: "vehicleNumber already exists" });
        throw e;
    }
}
async function deleteVehicle(req, res) {
    const id = Number(req.params.id);
    // Prevent delete if referenced by fuel entries
    const inUse = await prisma.fuelEntry.count({ where: { vehicleId: id } });
    if (inUse > 0) {
        return res
            .status(409)
            .json({ message: "Vehicle has fuel entries and cannot be deleted" });
    }
    try {
        await prisma.vehicle.delete({ where: { id } });
        res.json({ message: "Vehicle deleted" });
    }
    catch (e) {
        if (e.code === "P2025")
            return res.status(404).json({ message: "Vehicle not found" });
        throw e;
    }
}
/* ---------- PETRO CARDS ---------- */
async function listCards(req, res) {
    const search = String(req.query.search ?? "").trim();
    const page = Math.max(Number(req.query.page ?? 1), 1);
    const pageSize = Math.min(Math.max(Number(req.query.pageSize ?? 20), 1), 100);
    const walletRaw = String(req.query.wallet ?? "").trim().toUpperCase();
    const wallet = walletRaw === "IOCL" || walletRaw === "HPCL" ? walletRaw : undefined;
    const available = String(req.query.available ?? "").toLowerCase() === "true";
    const assignedToParam = req.query.assignedTo;
    const assignedTo = assignedToParam !== undefined && assignedToParam !== null && assignedToParam !== ""
        ? Number(assignedToParam)
        : undefined;
    const where = {};
    if (search) {
        where.cardNumber = { contains: search };
    }
    if (wallet)
        where.wallet = wallet;
    if (available)
        where.issuedToDriverId = null;
    if (assignedTo !== undefined && Number.isFinite(assignedTo)) {
        where.issuedToDriverId = assignedTo;
    }
    const [items, total] = await Promise.all([
        prisma.petroCard.findMany({
            where,
            orderBy: { id: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
            select: {
                id: true,
                cardNumber: true,
                wallet: true,
                issuedToDriverId: true,
            },
        }),
        prisma.petroCard.count({ where }),
    ]);
    res.json({ items, total, page, pageSize });
}
async function getCard(req, res) {
    const id = Number(req.params.id);
    const item = await prisma.petroCard.findUnique({
        where: { id },
        select: {
            id: true,
            cardNumber: true,
            wallet: true,
            issuedToDriverId: true,
        },
    });
    if (!item)
        return res.status(404).json({ message: "Card not found" });
    res.json(item);
}
async function createCard(req, res) {
    const cardNumber = String(req.body.cardNumber ?? "").trim();
    const wallet = String(req.body.wallet ?? "").trim();
    if (!cardNumber)
        return res.status(400).json({ message: "cardNumber is required" });
    if (!wallet)
        return res
            .status(400)
            .json({ message: "Wallet Type is required" });
    // const validTill = new Date(validTillStr);
    // if (isNaN(validTill.getTime()))
    //   return res.status(400).json({ message: "validTill is invalid date" });
    try {
        const created = await prisma.petroCard.create({
            data: { cardNumber, wallet },
            select: { id: true, cardNumber: true, wallet: true },
        });
        res.status(201).json(created);
    }
    catch (e) {
        if (e.code === "P2002")
            return res.status(409).json({ message: "cardNumber already exists" });
        throw e;
    }
}
async function updateCard(req, res) {
    const id = Number(req.params.id);
    const cardNumber = req.body.cardNumber?.trim();
    const wallet = req.body.wallet?.trim();
    // const validTillStr = req.body.validTill?.trim();
    const data = {};
    if (typeof cardNumber === "string" && cardNumber.length)
        data.cardNumber = cardNumber;
    // if (typeof validTillStr === "string" && validTillStr.length) {
    //   const dt = new Date(validTillStr);
    //   if (isNaN(dt.getTime()))
    //     return res.status(400).json({ message: "validTill is invalid date" });
    //   data.validTill = dt;
    // }
    try {
        const updated = await prisma.petroCard.update({
            where: { id },
            data,
            select: {
                id: true,
                cardNumber: true,
                wallet: true,
                issuedToDriverId: true,
            },
        });
        res.json(updated);
    }
    catch (e) {
        if (e.code === "P2025")
            return res.status(404).json({ message: "Card not found" });
        if (e.code === "P2002")
            return res.status(409).json({ message: "cardNumber already exists" });
        throw e;
    }
}
async function deleteCard(req, res) {
    const id = Number(req.params.id);
    // Prevent delete if referenced by fuel entries
    const inUse = await prisma.fuelEntry.count({ where: { cardId: id } });
    if (inUse > 0) {
        return res
            .status(409)
            .json({ message: "Card has fuel entries and cannot be deleted" });
    }
    try {
        await prisma.petroCard.delete({ where: { id } });
        res.json({ message: "Card deleted" });
    }
    catch (e) {
        if (e.code === "P2025")
            return res.status(404).json({ message: "Card not found" });
        throw e;
    }
}
//# sourceMappingURL=adminAssets.controller.js.map