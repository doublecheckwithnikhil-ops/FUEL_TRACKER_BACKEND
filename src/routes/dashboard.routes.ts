import { Router } from "express";
import { getDashboardStats, getRecentEntries } from "../controllers/dashboard.controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/stats", authMiddleware, getDashboardStats);

router.get("/recent", authMiddleware, getRecentEntries);

export default router;
