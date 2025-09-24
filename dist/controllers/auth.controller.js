"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.login = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const login = async (req, res) => {
    const { empCode, password } = req.body;
    try {
        const user = await prisma.user.findUnique({
            where: { empCode },
            include: {
                role: true,
                vehicles: true,
                petroCards: true,
            },
        });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        // Generate JWT
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role?.name }, process.env.JWT_SECRET, { expiresIn: "1d" });
        // Set cookie
        res.cookie("token", token, { httpOnly: true, secure: false });
        return res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                empCode: user.empCode,
                name: user.name,
                role: user.role?.name,
                vehicles: user.vehicles,
                petroCards: user.petroCards,
            },
        });
    }
    catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Server error", error });
    }
};
exports.login = login;
const logout = async (_req, res) => {
    try {
        res.clearCookie("token", { httpOnly: true, secure: false });
        return res.status(200).json({ success: true, message: "Logged out successfully" });
    }
    catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({ success: false, message: "Error logging out", error });
    }
};
exports.logout = logout;
//# sourceMappingURL=auth.controller.js.map