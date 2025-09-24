import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
export declare const roleMiddleware: (roles: ("admin" | "driver" | "super_admin")[]) => (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=role.d.ts.map