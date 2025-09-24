"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sync_1 = require("csv-parse/sync");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function deriveOwnType(owner, given) {
    if (given) {
        const g = given.toLowerCase().trim();
        if (g.startsWith("own"))
            return "OWNED";
        if (g.startsWith("rent"))
            return "RENTED";
    }
    if (!owner)
        return null;
    const s = owner.toLowerCase().trim();
    return (s.startsWith("v2 retail")) ? "OWNED" : "RENTED";
}
function toDecimalOrNull(v) {
    if (v === null || v === undefined || v === "")
        return null;
    const num = Number(String(v).replace(/,/g, "").trim());
    return Number.isFinite(num) ? num : null;
}
async function run() {
    const csvPath = path_1.default.resolve(process.cwd(), "vehicle.csv");
    const raw = fs_1.default.readFileSync(csvPath, "utf8");
    const rows = (0, sync_1.parse)(raw, { columns: true, skip_empty_lines: true });
    let created = 0, updated = 0, skipped = 0;
    for (const r of rows) {
        const vehicleNumber = (r.vehicleNumber ?? "").toString().trim();
        if (!vehicleNumber) {
            skipped++;
            continue;
        }
        const data = {
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
        }
        else {
            await prisma.vehicle.create({ data });
            created++;
        }
    }
    console.log(`Done. Created: ${created}, Updated: ${updated}, Skipped (missing vehicleNumber): ${skipped}`);
}
run()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
//# sourceMappingURL=uploadVehicles.js.map