import 'dotenv/config';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const API_BASE =
  process.env.EMP_API_BASE ??
  'https://v2parivar.v2retail.com:9987/api/EmployeeNew/GetEmployeeDetailsWithCards';

const PAGE_SIZE = 100000;
const DRIVER_ROLE_ID = Number(2);
const FORCE_RESET_PASSWORD = process.env.FORCE_RESET_PASSWORD === 'true';

type Employee = {
  employeeId: number;
  fullName: string;
  departmentName: string | null;
  designationName: string | null;
  locationName: string | null;
  storeCode: string | null;
  ecode: string | null;
  isActive: boolean;
};

async function fetchPage(pageNumber: number): Promise<Employee[]> {
  const url = `${API_BASE}?pageNumber=${pageNumber}&pageSize=${PAGE_SIZE}&mode=all`;
  const { data } = await axios.get(url, {
    // headers: { Authorization: `Bearer ${process.env.EMP_API_TOKEN}` }, // if needed
    timeout: 30000,
  });
  return (data?.employees ?? []) as Employee[];
}

async function ensureDriverRoleExists() {
  const role = await prisma.role.findFirst({ where: { id: DRIVER_ROLE_ID } });
  if (!role) {
    // If your schema requires a name, create it; else, remove this.
    await prisma.role.create({
      data: { id: DRIVER_ROLE_ID, name: 'driver' },
    }).catch(() => {});
  }
}

async function run() {
  await ensureDriverRoleExists();

  // Precompute the bcrypt hash once
  const defaultPasswordHash = await bcrypt.hash('V2@123', 10);

  let page = 1;
  let totalInserted = 0;
  let totalUpdated = 0;

  while (true) {
    const employees = await fetchPage(page);
    if (employees.length === 0) break;

    const drivers = employees.filter(
      (e) => e.designationName?.toUpperCase() === 'DRIVER' && e.isActive
    );

    for (const e of drivers) {
      // Choose your unique key; prefer employeeId if guaranteed unique, else empCode
      const where =
        e.employeeId
          ? { employeeId: e.employeeId }
          : e.ecode
          ? { empCode: e.ecode }
          : null;

      if (!where) continue; // skip if both missing

      // Check existence first to decide about password overwrite
      const existing = await prisma.user.findFirst({ where });

      const baseData = {
        name: (e.fullName ?? '').trim() || 'Unknown',
        empCode: e.ecode ?? null,
        employeeId: e.employeeId || null,
        departmentName: e.departmentName ?? null,
        designationName: e.designationName ?? null,
        locationName: e.locationName ?? null,
        storeCode: e.storeCode ?? null,
        roleId: DRIVER_ROLE_ID,
      } as const;

      if (existing) {
        // Update (don’t reset password unless forced)
        await prisma.user.update({
          where: { id: existing.id },
          data: {
            ...baseData,
            ...(FORCE_RESET_PASSWORD ? { password: defaultPasswordHash } : {}),
          },
        });
        totalUpdated++;
      } else {
        // Insert (set default password)
        await prisma.user.create({
          data: {
            ...baseData,
            password: defaultPasswordHash,
          },
        });
        totalInserted++;
      }
    }

    if (employees.length < PAGE_SIZE) break; // last page
    page++;
  }

  console.log(`Done. Inserted: ${totalInserted}, Updated: ${totalUpdated}`);
}

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
