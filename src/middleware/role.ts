import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";

export const roleMiddleware = (roles: ("admin" | "driver")[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.sendStatus(403);
    }
    next();
  };
};
