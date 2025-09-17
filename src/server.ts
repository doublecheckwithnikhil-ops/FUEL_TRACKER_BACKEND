import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes";
import fuelRoutes from "./routes/fuel.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import OpenAI from "openai";
import multer from "multer";

dotenv.config();

const app = express();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const upload = multer({ dest: "uploads/" });

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(cors({
  origin: [
    "http://localhost:5173",         // local dev
    "http://192.168.151.42:8090"     // IIS frontend
  ],
  credentials: true
}));

// routes
app.use("/api/auth", authRoutes);
app.use("/api", fuelRoutes);
app.use("/api/dashboard", dashboardRoutes);

// OCR endpoint
app.post("/api/ocr-extract", upload.single("billPhoto"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fs = await import("fs");
    const fileData = fs.readFileSync(req.file.path, { encoding: "base64" });

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: `You are an OCR assistant. Extract bill details (billNumber, quantity, ratePerLitre, totalValue) from this fuel bill image. Respond ONLY in JSON.

Here is the image as base64: data:image/jpeg;base64,${fileData}`
    });

    // The model output text
    const extractedText = response.output_text;

    // Try to parse JSON safely
    let parsedData = {};
    try {
      parsedData = JSON.parse(extractedText || "{}");
    } catch {
      return res.status(500).json({ error: "Failed to parse OCR result" });
    }

    return res.json(parsedData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "OCR processing failed" });
  }
});



require('./swagger')(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
