"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const role_1 = require("../middleware/role");
const upload_1 = require("../middleware/upload");
const fuel_controller_1 = require("../controllers/fuel.controller");
const assignment_controller_1 = require("../controllers/assignment.controller");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Fuel
 *   description: Fuel management endpoints
 */
/**
 * @swagger
 * /api/fuel-entry:
 *   post:
 *     summary: Add a fuel entry (Driver)
 *     tags: [Fuel]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               vehicleId:
 *                 type: string
 *                 description: Vehicle ID
 *               cardId:
 *                 type: string
 *                 description: Fuel card ID
 *               location:
 *                 type: string
 *                 description: Latitude,Longitude
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               odometerReading:
 *                 type: number
 *               billNumber:
 *                 type: string
 *               quantity:
 *                 type: number
 *               ratePerLitre:
 *                 type: number
 *               amount:
 *                 type: number
 *               meterImg:
 *                 type: string
 *                 format: binary
 *               billImg:
 *                 type: string
 *                 format: binary
 *             required:
 *               - vehicleId
 *               - cardId
 *               - quantity
 *               - ratePerLitre
 *               - amount
 *     responses:
 *       201:
 *         description: Fuel entry created
 *       401:
 *         description: Unauthorized
 */
router.post("/fuel-entry", auth_1.authMiddleware, upload_1.upload.fields([
    { name: "billImg", maxCount: 1 },
    { name: "meterImg", maxCount: 1 },
]), fuel_controller_1.addFuelEntry);
/**
 * @swagger
 * /api/fuel-entry:
 *   get:
 *     summary: Get all fuel entries
 *     tags: [Fuel]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of all fuel entries
 *       401:
 *         description: Unauthorized
 */
router.get("/fuel-entry", auth_1.authMiddleware, (0, role_1.roleMiddleware)(["admin"]), fuel_controller_1.getAllFuelEntries);
/**
 * @swagger
 * /api/fuel-entry/{id}:
 *   get:
 *     summary: Get a fuel entry by ID
 *     tags: [Fuel]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Fuel entry ID
 *     responses:
 *       200:
 *         description: Fuel entry found
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Fuel entry not found
 */
router.get("/fuel-entry/:id", auth_1.authMiddleware, (0, role_1.roleMiddleware)(["admin", "driver"]), fuel_controller_1.getFuelEntryById);
/**
 * @swagger
 * /api/my-entries:
 *   get:
 *     summary: Get all fuel entries of a driver
 *     tags: [Fuel]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of all fuel entries
 *       401:
 *         description: Unauthorized
 */
router.get("/my-entries", auth_1.authMiddleware, (0, role_1.roleMiddleware)(["driver"]), fuel_controller_1.getMyFuelEntries);
// --- Admin: Assignments ---
/**
 * @swagger
 * /api/admin/drivers:
 *   get:
 *     summary: List drivers (searchable)
 *     tags: [Fuel]
 *     security: [ { cookieAuth: [] } ]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 */
router.get("/admin/drivers", auth_1.authMiddleware, (0, role_1.roleMiddleware)(["admin"]), assignment_controller_1.listDrivers);
/**
 * @swagger
 * /api/admin/vehicles:
 *   get:
 *     summary: List vehicles (optionally only available)
 *     tags: [Fuel]
 *     security: [ { cookieAuth: [] } ]
 *     parameters:
 *       - in: query
 *         name: available
 *         schema: { type: boolean }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 */
router.get("/admin/vehicles", auth_1.authMiddleware, (0, role_1.roleMiddleware)(["admin"]), assignment_controller_1.listVehicles);
/**
 * @swagger
 * /api/admin/petrocards:
 *   get:
 *     summary: List petro cards (optionally only available)
 *     tags: [Fuel]
 *     security: [ { cookieAuth: [] } ]
 *     parameters:
 *       - in: query
 *         name: available
 *         schema: { type: boolean }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 */
router.get("/admin/petrocards", auth_1.authMiddleware, (0, role_1.roleMiddleware)(["admin"]), assignment_controller_1.listPetroCards);
/**
 * @swagger
 * /api/admin/assignments/vehicle:
 *   post:
 *     summary: Assign a vehicle to a driver
 *     tags: [Fuel]
 *     security: [ { cookieAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [vehicleId, userId]
 *             properties:
 *               vehicleId: { type: integer }
 *               userId: { type: integer }
 *     responses:
 *       200: { description: Assigned }
 *       409: { description: Already assigned }
 */
router.post("/admin/assignments/vehicle", auth_1.authMiddleware, (0, role_1.roleMiddleware)(["admin"]), assignment_controller_1.assignVehicle);
/**
 * @swagger
 * /api/admin/assignments/vehicle/{vehicleId}:
 *   delete:
 *     summary: De-assign a vehicle (make available)
 *     tags: [Fuel]
 *     security: [ { cookieAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: vehicleId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: De-assigned }
 */
router.delete("/admin/assignments/vehicle/:vehicleId", auth_1.authMiddleware, (0, role_1.roleMiddleware)(["admin"]), assignment_controller_1.deassignVehicle);
/**
 * @swagger
 * /api/admin/assignments/petrocard:
 *   post:
 *     summary: Assign a petro card to a driver
 *     tags: [Fuel]
 *     security: [ { cookieAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cardId, userId]
 *             properties:
 *               cardId: { type: integer }
 *               userId: { type: integer }
 *     responses:
 *       200: { description: Assigned }
 *       409: { description: Already assigned }
 */
router.post("/admin/assignments/petrocard", auth_1.authMiddleware, (0, role_1.roleMiddleware)(["admin"]), assignment_controller_1.assignCard);
/**
 * @swagger
 * /api/admin/assignments/petrocard/{cardId}:
 *   delete:
 *     summary: De-assign a petro card (make available)
 *     tags: [Fuel]
 *     security: [ { cookieAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: cardId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: De-assigned }
 */
router.delete("/admin/assignments/petrocard/:cardId", auth_1.authMiddleware, (0, role_1.roleMiddleware)(["admin"]), assignment_controller_1.deassignCard);
exports.default = router;
//# sourceMappingURL=fuel.routes.js.map