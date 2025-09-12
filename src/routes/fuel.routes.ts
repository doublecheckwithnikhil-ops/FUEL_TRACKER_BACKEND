import { Router } from "express";
import { addFuelEntry, getAllFuelEntries, getFuelEntryById, getMyFuelEntries } from "../controllers/fuel.controller";
import { authMiddleware } from "../middleware/auth";
import { roleMiddleware } from "../middleware/role";
import { upload } from "../middleware/upload";

const router = Router();

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
router.post(
  "/fuel-entry",
  authMiddleware,
  upload.fields([
    { name: "billImg", maxCount: 1 },
    { name: "meterImg", maxCount: 1 },
  ]),
  addFuelEntry
);

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
router.get("/fuel-entry", authMiddleware, roleMiddleware(["admin"]), getAllFuelEntries);

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
router.get("/fuel-entry/:id", authMiddleware, roleMiddleware(["admin", "driver"]), getFuelEntryById);

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
router.get("/my-entries", authMiddleware, roleMiddleware(["driver"]), getMyFuelEntries);

export default router;
