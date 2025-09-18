import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const login = async (req: Request, res: Response) => {
  const { empCode, password } = req.body;

  console.log(empCode);
  

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

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role?.name },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

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
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

export const logout = async (_req: Request, res: Response) => {
  try {
    res.clearCookie("token", { httpOnly: true, secure: false });
    return res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ success: false, message: "Error logging out", error });
  }
};
