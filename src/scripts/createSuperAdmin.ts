import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {

  // 1) Ensure roles exist
  const roleNames = ["driver", "admin", "super_admin"] as const;
  const roles = await Promise.all(
    roleNames.map(async (name) =>
      prisma.role.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );
  const SUPER_ADMIN = roles.find((r) => r.name === "super_admin")!;
  console.log(`✅ Role ensured: super_admin (id=${SUPER_ADMIN.id})`);

  // 2) Create or upgrade the user
  const existing = await prisma.user.findUnique({
    where: { empCode: "RTNR63" },
    select: { id: true, roleId: true },
  });

  const passwordHash = await bcrypt.hash("V2@123", 10);

  if (!existing) {
    const u = await prisma.user.create({
      data: {
        name: "Nikhil Vig",
        password: passwordHash,
        roleId: SUPER_ADMIN.id,
        empCode: "RTNR63",
        employeeId: null
      },
    });
    console.log(`✅ Super admin created: ${u.name} (id=${u.id})`);
  } else {
    const u = await prisma.user.update({
      where: { empCode: "RTNR63" },
      data: { name: "Nikhil Vig", password: passwordHash, roleId: SUPER_ADMIN.id, empCode: "RTNR63" },
    });
    console.log(`✅ Existing user promoted to SUPER_ADMIN: ${u.name} (id=${u.id})`);
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    // process.exit(1);
  })
  .finally(() => prisma.$disconnect());
