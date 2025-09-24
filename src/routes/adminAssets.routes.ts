import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { roleMiddleware } from "../middleware/role";
import {
  listVehicles, createVehicle, updateVehicle, deleteVehicle, getVehicle,
  listCards, createCard, updateCard, deleteCard, getCard
} from "../controllers/adminAssets.controller";

const router = Router();

router.use(authMiddleware, roleMiddleware(["admin"]));

/** Vehicles */


router.get("/vehicles", listVehicles);
router.post("/vehicles", createVehicle);
router.get("/vehicles/:id", getVehicle);
router.put("/vehicles/:id", updateVehicle);
router.delete("/vehicles/:id", deleteVehicle);

/** Petro Cards */
router.get("/petrocards", listCards);
router.post("/petrocards", createCard);
router.get("/petrocards/:id", getCard);
router.put("/petrocards/:id", updateCard);
router.delete("/petrocards/:id", deleteCard);

export default router;