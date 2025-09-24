import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function run() {
  const defaultPasswordHash = await bcrypt.hash("V2@123", 10);

  await prisma.user.upsert({
    where: { empCode: "RTNR63" },
    update: { name: "Nikhil Vig", roleId: 3 },
    create: {
      name: "Nikhil Vig",
      empCode: "RTNR63",
      password: defaultPasswordHash,
      roleId: 3,
      employeeId: 9999
    },
  });

  console.log("Admin user created/updated");
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
