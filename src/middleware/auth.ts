import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: { id: number; role: "admin" | "driver" };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.token;

  console.log("token -> ", token);
  
  
  if (!token) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number; role: "admin" | "driver" };
    req.user = decoded;
    next();
  } catch (err) {
    res.sendStatus(403);
  }
};