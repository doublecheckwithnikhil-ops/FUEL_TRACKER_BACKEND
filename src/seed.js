import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create Roles
  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: { name: "admin" },
  });

  const driverRole = await prisma.role.upsert({
    where: { name: "driver" },
    update: {},
    create: { name: "driver" },
  });

  // Hash passwords
  const adminPass = await bcrypt.hash("admin123", 10);
  const driverPass = await bcrypt.hash("driver123", 10);

  // Create Users
  const adminUser = await prisma.user.upsert({
    where: { empCode: "RTN124" },
    update: {},
    create: {
      name: "admin",
      password: adminPass,
      roleId: adminRole.id,
      empCode: "RTN124"
    },
  });

  const driverUser = await prisma.user.upsert({
    where: { empCode: "RTN125" },
    update: {},
    create: {
      name: "driver1",
      password: driverPass,
      roleId: driverRole.id,
      empCode: "RTN125"
    },
  });

  // Create Vehicle
  const vehicle = await prisma.vehicle.upsert({
    where: { vehicleNumber: "KA01AB1234" },
    update: {},
    create: {
      vehicleNumber: "KA01AB1234",
      capacity: 5000,
      assignedDriverId: driverUser.id,
    },
  });

  // Create PetroCard
  await prisma.petroCard.upsert({
    where: { cardNumber: "PC123456" },
    update: {},
    create: {
      cardNumber: "PC123456",
      validTill: "2026-12-31",
      issuedToDriverId: driverUser.id,
    },
  });

  console.log("Seed completed successfully");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });