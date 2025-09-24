import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";

export const roleMiddleware = (roles: ("admin" | "driver" | "super_admin")[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.sendStatus(403);
    }
    next();
  };
};
