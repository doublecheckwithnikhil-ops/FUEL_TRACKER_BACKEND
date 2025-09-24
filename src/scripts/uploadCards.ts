// scripts/importCards.ts
import "dotenv/config";
import * as path from "path";
import * as fs from "fs";
import * as XLSX from "xlsx";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ---- CONFIG ----
const SHEETS = ["IOCL", "HPCL"] as const;

const COLUMN_BY_SHEET: Record<(typeof SHEETS)[number], string[]> = {
  IOCL: ["Account Number", "AccountNumber", "Account  Number", "ACCOUNT NUMBER", "ACCOUNT_NO"],
  HPCL: ["PETRO CARD", "PETRO_CARD", "PETROCARD", "PETRO CARD NO", "CARD NO"],
};

// sheet -> wallet string
const WALLET_BY_SHEET: Record<(typeof SHEETS)[number], string> = {
  IOCL: "IOCL",
  HPCL: "HPCL",
};

const DRY_RUN = String(process.env.DRY_RUN ?? "").toLowerCase() === "true";
// Optional default validTill if your column is REQUIRED. If optional, you can ignore this.
const DEFAULT_VALID_TILL = process.env.CARD_DEFAULT_VALID_TILL || "2100-01-01";

// ---- Helpers ----
function normalizeCardNumber(raw: unknown): string | null {
  if (raw === undefined || raw === null) return null;
  let s = String(raw).trim();
  if (s.startsWith("'")) s = s.slice(1);  // Excel apostrophe
  s = s.replace(/[\s-]+/g, "");           // spaces/dashes
  return s || null;
}

function findColumnIndex(headers: string[], candidates: string[]): number {
  const norm = (v: string) => v.trim().toLowerCase();
  const hmap = headers.map(norm);
  for (const c of candidates) {
    const idx = hmap.indexOf(norm(c));
    if (idx >= 0) return idx;
  }
  return -1;
}

type ImportResult = {
  fromSheet: string;
  rawCount: number;
  normalizedCount: number;
  uniqueCount: number;
  created: number;
  skippedExisting: number;
  samples: string[];
};

async function createOrSkip(cardNumber: string, wallet: string): Promise<"created" | "skipped"> {
  try {
    if (DRY_RUN) {
      const existing = await prisma.petroCard.findUnique({ where: { cardNumber } });
      return existing ? "skipped" : "created";
    }
    await prisma.petroCard.create({
      data: {
        cardNumber,
        wallet,
      },
    });
    return "created";
  } catch (e: any) {
    if (e?.code === "P2002") return "skipped"; // unique(cardNumber)
    console.error("Create failed for", cardNumber, e);
    return "skipped";
  }
}

async function upsertCards(cardNumbers: string[], sheetName: (typeof SHEETS)[number]): Promise<ImportResult> {
  const cleaned = cardNumbers.filter(Boolean);
  const unique = Array.from(new Set(cleaned));
  const wallet = WALLET_BY_SHEET[sheetName];

  let created = 0;
  let skippedExisting = 0;

  for (const cn of unique) {
    const res = await createOrSkip(cn, wallet);
    if (res === "created") created++; else skippedExisting++;
  }

  return {
    fromSheet: sheetName,
    rawCount: cardNumbers.length,
    normalizedCount: cleaned.length,
    uniqueCount: unique.length,
    created,
    skippedExisting,
    samples: unique.slice(0, 10),
  };
}

// ---- Main ----
async function run() {
  const argPath = process.argv[2];
  // If script is at backend/scripts and file at backend root:
  const defaultPath = path.resolve(__dirname, "../../Fuel recosilation report September-2025.xlsx");
  const filePath = argPath ? path.resolve(argPath) : defaultPath;

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const wb = XLSX.readFile(filePath, { cellDates: true });
  const results: ImportResult[] = [];

  for (const sheetName of SHEETS) {
    const ws = wb.Sheets[sheetName];
    if (!ws) {
      console.warn(`Sheet "${sheetName}" not found. Skipping.`);
      continue;
    }

    const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
    if (!rows.length) {
      console.warn(`Sheet "${sheetName}" is empty. Skipping.`);
      continue;
    }

    const headers = rows[0]!.map((h: any) => String(h ?? "").trim());
    const colIdx = findColumnIndex(headers, COLUMN_BY_SHEET[sheetName]);
    if (colIdx === -1) {
      console.warn(`Sheet "${sheetName}" does not contain any of: ${COLUMN_BY_SHEET[sheetName].join(", ")}`);
      continue;
    }

    const cardNumbersRaw: string[] = [];
    for (let r = 1; r < rows.length; r++) {
      const cell = rows[r]![colIdx];
      const card = normalizeCardNumber(cell);
      if (card) cardNumbersRaw.push(card);
    }

    const res = await upsertCards(cardNumbersRaw, sheetName);
    results.push(res);
  }

  console.table(
    results.map((r) => ({
      sheet: r.fromSheet,
      raw: r.rawCount,
      normalized: r.normalizedCount,
      unique: r.uniqueCount,
      created: r.created,
      skipped: r.skippedExisting,
    }))
  );

  for (const r of results) {
    console.log(`\n[${r.fromSheet}] sample cardNumbers: ${r.samples.join(", ")}`);
  }
  console.log(`\nDone. DRY_RUN=${DRY_RUN}`);
}

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
