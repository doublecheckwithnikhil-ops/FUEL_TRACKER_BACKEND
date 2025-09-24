import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Row = {
  vehicleNumber: string;
  size?: string | null;
  tankSize?: string | number | null;
  owner?: string | null;
  ownType?: string | null;
  modelNumber?: string | null;
  fuelType?: string | null;
};

function deriveOwnType(owner?: string | null, given?: string | null): "OWNED" | "RENTED" | null {
  if (given) {
    const g = given.toLowerCase().trim();
    if (g.startsWith("own")) return "OWNED";
    if (g.startsWith("rent")) return "RENTED";
  }
  if (!owner) return null;
  const s = owner.toLowerCase().trim();
  return (s.startsWith("v2 retail")) ? "OWNED" : "RENTED";
}

function toDecimalOrNull(v: any) {
  if (v === null || v === undefined || v === "") return null;
  const num = Number(String(v).replace(/,/g, "").trim());
  return Number.isFinite(num) ? num : null;
}

async function run() {
  const csvPath = path.resolve(process.cwd(), "vehicle.csv");
  const raw = fs.readFileSync(csvPath, "utf8");
  const rows = parse(raw, { columns: true, skip_empty_lines: true }) as Row[];

  let created = 0, updated = 0, skipped = 0;

  for (const r of rows) {
    const vehicleNumber = (r.vehicleNumber ?? "").toString().trim();
    if (!vehicleNumber) { skipped++; continue; }

    const data: any = {
      vehicleNumber,
      size: r.size?.toString().trim() || null,
      tankSize: r.tankSize?.toString().trim() || null,
      owner: r.owner?.toString().trim() || null,
      ownType: deriveOwnType(r.owner ?? null, r.ownType ?? null),
      modelNumber: r.modelNumber?.toString().trim() || null,
      fuelType: r.fuelType?.toString().trim() || null,
      // leave assignedDriverId as NULL by default
    };

    const existing = await prisma.vehicle.findUnique({
      where: { vehicleNumber },
      select: { id: true },
    });

    if (existing) {
      await prisma.vehicle.update({
        where: { vehicleNumber },
        data,
      });
      updated++;
    } else {
      await prisma.vehicle.create({ data });
      created++;
    }
  }

  console.log(`Done. Created: ${created}, Updated: ${updated}, Skipped (missing vehicleNumber): ${skipped}`);
}

run()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
