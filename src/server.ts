import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes";
import fuelRoutes from "./routes/fuel.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import adminAssetRoutes from "./routes/adminAssets.routes";
import superadminRoutes from "./routes/superAdmin.routes";
import OpenAI from "openai";
import multer from "multer";
import sharp from "sharp";

dotenv.config();

const app = express();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const upload = multer({ dest: "uploads/" });

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(
  cors({
    origin: [
      "http://localhost:5173", // local dev
      "https://192.168.151.42:8090", // IIS frontend
      "http://192.168.151.42:8092", // IIS frontend
    ],
    credentials: true,
  })
);
// app.use(
//   cors({
//     origin: "*",
//     credentials: true,
//   })
// );


// routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminAssetRoutes);     
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/super-admin", superadminRoutes);
app.use("/api", fuelRoutes);              


// OCR endpoint
app.post("/api/ocr-extract", upload.single("billImg"), async (req, res) => {
  let tmpPath: string | undefined;
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    tmpPath = req.file.path;

    const buf = await sharp(tmpPath)
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    const base64 = buf.toString("base64");
    const mime = req.file.mimetype || "image/jpeg";
    const dataUrl = `data:${mime};base64,${base64}`;

    // ✅ Use Chat Completions with vision-friendly content parts
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      max_completion_tokens: 200,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                "Extract billNumber (string), quantity (number), ratePerLitre (number), totalValue (number). " +
                "Return STRICT JSON with exactly those keys. No explanations.",
            },
            // image input (typed as MessageContentImageUrlObject in SDK)
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
    });

    const msg = completion.choices[0]?.message;
    const text = msg?.content ?? "{}";

    const raw = JSON.parse(text);
    const toNum = (v: unknown) => {
      const n = parseFloat(String(v ?? "").replace(/[^\d.-]/g, ""));
      return Number.isFinite(n) ? n : undefined;
    };

    const payload = {
      billNumber: String(raw.billNumber ?? "").trim(),
      quantity: toNum(raw.quantity),
      ratePerLitre: toNum(raw.ratePerLitre),
      totalValue: toNum(raw.totalValue ?? raw.totalAmount),
    };

    return res.json(payload);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "OCR processing failed" });
  } finally {
    try {
      if (tmpPath) {
        const fs = await import("fs/promises");
        await fs.unlink(tmpPath);
      }
    } catch {
      /* ignore */
    }
  }
});

require("./swagger")(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
