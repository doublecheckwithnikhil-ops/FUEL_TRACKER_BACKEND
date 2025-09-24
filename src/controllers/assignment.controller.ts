import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const DRIVER_ROLE_ID = 2;

/** GET /api/admin/drivers?search= */
export async function listDrivers(req: Request, res: Response) {
  const search = (req.query.search as string)?.trim() ?? "";
  const where: any = {
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
export async function listVehicles(req: Request, res: Response) {
  const search = (req.query.search as string)?.trim() ?? "";
  const available = String(req.query.available ?? "").toLowerCase() === "true";

  const where: any = {
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
export async function listPetroCards(req: Request, res: Response) {
  const search = (req.query.search as string)?.trim() ?? "";
  const available = String(req.query.available ?? "").toLowerCase() === "true";

  const where: any = {
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
export async function assignVehicle(req: Request, res: Response) {
  const vehicleId = Number(req.body.vehicleId);
  const userId = Number(req.body.userId);
  if (!vehicleId || !userId) return res.status(400).json({ message: "vehicleId and userId are required" });

  const driver = await prisma.user.findUnique({ where: { id: userId } });
  if (!driver || driver.roleId !== DRIVER_ROLE_ID) {
    return res.status(400).json({ message: "User must be a driver." });
  }

  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) return res.status(404).json({ message: "Vehicle not found." });
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
export async function deassignVehicle(req: Request, res: Response) {
  const vehicleId = Number(req.params.vehicleId);
  if (!vehicleId) return res.status(400).json({ message: "vehicleId required" });

  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) return res.status(404).json({ message: "Vehicle not found." });

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
export async function assignCard(req: Request, res: Response) {
  const cardId = Number(req.body.cardId);
  const userId = Number(req.body.userId);
  if (!cardId || !userId) return res.status(400).json({ message: "cardId and userId are required" });

  const driver = await prisma.user.findUnique({ where: { id: userId } });
  if (!driver || driver.roleId !== DRIVER_ROLE_ID) {
    return res.status(400).json({ message: "User must be a driver." });
  }

  const card = await prisma.petroCard.findUnique({ where: { id: cardId } });
  if (!card) return res.status(404).json({ message: "Card not found." });
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
export async function deassignCard(req: Request, res: Response) {
  const cardId = Number(req.params.cardId);
  if (!cardId) return res.status(400).json({ message: "cardId required" });

  const card = await prisma.petroCard.findUnique({ where: { id: cardId } });
  if (!card) return res.status(404).json({ message: "Card not found." });

  if (!card.issuedToDriverId) {
    return res.json({ message: "Card already available.", card });
  }

  const updated = await prisma.petroCard.update({
    where: { id: cardId },
    data: { issuedToDriverId: null },
  });

  res.json({ message: "Card de-assigned.", card: updated });
}