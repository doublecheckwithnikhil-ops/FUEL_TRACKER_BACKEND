"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const fuel_routes_1 = __importDefault(require("./routes/fuel.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const openai_1 = __importDefault(require("openai"));
const multer_1 = __importDefault(require("multer"));
const sharp_1 = __importDefault(require("sharp"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const client = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
const upload = (0, multer_1.default)({ dest: "uploads/" });
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:5173", // local dev
        "https://192.168.151.42:8090", // IIS frontend
        "http://192.168.151.42:8092", // IIS frontend
    ],
    credentials: true,
}));
// app.use(
//   cors({
//     origin: "*",
//     credentials: true,
//   })
// );
// routes
app.use("/api/auth", auth_routes_1.default);
app.use("/api", fuel_routes_1.default);
app.use("/api/dashboard", dashboard_routes_1.default);
// OCR endpoint
app.post("/api/ocr-extract", upload.single("billImg"), async (req, res) => {
    let tmpPath;
    try {
        if (!req.file)
            return res.status(400).json({ error: "No file uploaded" });
        tmpPath = req.file.path;
        const buf = await (0, sharp_1.default)(tmpPath)
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
                            text: "Extract billNumber (string), quantity (number), ratePerLitre (number), totalValue (number). " +
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
        const toNum = (v) => {
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
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "OCR processing failed" });
    }
    finally {
        try {
            if (tmpPath) {
                const fs = await Promise.resolve().then(() => __importStar(require("fs/promises")));
                await fs.unlink(tmpPath);
            }
        }
        catch {
            /* ignore */
        }
    }
});
require("./swagger")(app);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
//# sourceMappingURL=server.js.map