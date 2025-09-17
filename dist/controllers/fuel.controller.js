"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyFuelEntries = exports.getFuelEntryById = exports.getAllFuelEntries = exports.addFuelEntry = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Add new fuel entry (Driver)
const addFuelEntry = async (req, res) => {
    try {
        const { vehicleId, cardId, location, latitude, longitude, odometerReading, billNumber, quantity, ratePerLitre, amount, } = req.body;
        const billFile = req.files?.billImg?.[0]?.path.replace(/\\/g, "/") || null;
        const meterFile = req.files?.meterImg?.[0]?.path.replace(/\\/g, "/") || null;
        const fuelEntry = await prisma.fuelEntry.create({
            data: {
                vehicleId: Number(vehicleId),
                cardId: Number(cardId),
                driverId: req.user.id,
                location,
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                odometerReading: parseFloat(odometerReading),
                billNumber,
                quantity: parseFloat(quantity),
                ratePerLitre: parseFloat(ratePerLitre),
                amount: parseFloat(amount),
                billImg: billFile,
                meterImg: meterFile,
                createdAt: new Date(),
            },
        });
        res.status(201).json({ success: true, data: fuelEntry });
    }
    catch (err) {
        console.error("Error adding fuel entry:", err);
        res.status(500).json({
            success: false,
            message: "Error adding fuel entry",
            error: err,
        });
    }
};
exports.addFuelEntry = addFuelEntry;
// Get all fuel entries (Admin)
const getAllFuelEntries = async (_req, res) => {
    try {
        const fuelEntries = await prisma.fuelEntry.findMany({
            include: {
                driver: { select: { id: true, name: true } },
                vehicle: { select: { id: true, vehicleNumber: true } },
                petroCard: { select: { id: true, cardNumber: true } },
            },
        });
        res.status(200).json({ success: true, data: fuelEntries });
    }
    catch (err) {
        console.error("Error fetching fuel entries:", err);
        res
            .status(500)
            .json({
            success: false,
            message: "Error fetching fuel entries",
            error: err,
        });
    }
};
exports.getAllFuelEntries = getAllFuelEntries;
// Get single fuel entry by ID (Admin/Driver)
const getFuelEntryById = async (req, res) => {
    try {
        const { id } = req.params;
        const fuelEntry = await prisma.fuelEntry.findUnique({
            where: { id: Number(id) },
            include: {
                driver: { select: { id: true, name: true } },
                vehicle: { select: { id: true, vehicleNumber: true } },
                petroCard: { select: { id: true, cardNumber: true } },
            },
        });
        if (!fuelEntry) {
            return res
                .status(404)
                .json({ success: false, message: "Fuel entry not found" });
        }
        res.status(200).json({ success: true, data: fuelEntry });
    }
    catch (err) {
        console.error("Error fetching fuel entry:", err);
        res
            .status(500)
            .json({
            success: false,
            message: "Error fetching fuel entry",
            error: err,
        });
    }
};
exports.getFuelEntryById = getFuelEntryById;
// Get all entries for the logged-in driver
const getMyFuelEntries = async (req, res) => {
    try {
        const entries = await prisma.fuelEntry.findMany({
            where: { driverId: req.user.id },
            include: {
                vehicle: true,
                petroCard: true,
            },
            orderBy: { id: 'desc' },
        });
        res.status(200).json({ success: true, data: entries });
    }
    catch (err) {
        console.error("Error fetching driver entries:", err);
        res.status(500).json({
            success: false,
            message: "Error fetching fuel entries",
            error: err,
        });
    }
};
exports.getMyFuelEntries = getMyFuelEntries;
//# sourceMappingURL=fuel.controller.js.map