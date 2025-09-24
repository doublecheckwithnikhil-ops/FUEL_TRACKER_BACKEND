"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const role_1 = require("../middleware/role");
const adminAssets_controller_1 = require("../controllers/adminAssets.controller");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware, (0, role_1.roleMiddleware)(["admin"]));
/** Vehicles */
router.get("/vehicles", adminAssets_controller_1.listVehicles);
router.post("/vehicles", adminAssets_controller_1.createVehicle);
router.get("/vehicles/:id", adminAssets_controller_1.getVehicle);
router.put("/vehicles/:id", adminAssets_controller_1.updateVehicle);
router.delete("/vehicles/:id", adminAssets_controller_1.deleteVehicle);
/** Petro Cards */
router.get("/petrocards", adminAssets_controller_1.listCards);
router.post("/petrocards", adminAssets_controller_1.createCard);
router.get("/petrocards/:id", adminAssets_controller_1.getCard);
router.put("/petrocards/:id", adminAssets_controller_1.updateCard);
router.delete("/petrocards/:id", adminAssets_controller_1.deleteCard);
exports.default = router;
//# sourceMappingURL=adminAssets.routes.js.map