import { Request, Response } from "express";
interface AuthRequest extends Request {
    user?: {
        id: number;
        role: string;
    };
    files?: Express.Multer.File[] | {
        [fieldname: string]: Express.Multer.File[];
    };
}
export declare const addFuelEntry: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getAllFuelEntries: (_req: AuthRequest, res: Response) => Promise<void>;
export declare const getFuelEntryById: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getMyFuelEntries: (req: AuthRequest, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=fuel.controller.d.ts.map