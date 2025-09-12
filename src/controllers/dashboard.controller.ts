import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";

const prisma = new PrismaClient();

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    let where = {};

    if (user.role === "driver") {
      where = { driverId: user.id };
    }

    const total = await prisma.fuelEntry.count({ where });

    res.json({ total });
  } catch (err) {
    console.error("Error fetching dashboard stats", err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};

export const getRecentEntries = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
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
  } catch (err) {
    console.error("Error fetching recent entries", err);
    res.status(500).json({ message: "Failed to fetch recent entries" });
  }
};
