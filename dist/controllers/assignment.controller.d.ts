import { Request, Response } from "express";
/** GET /api/admin/drivers?search= */
export declare function listDrivers(req: Request, res: Response): Promise<void>;
/** GET /api/admin/vehicles?available=true&search= */
export declare function listVehicles(req: Request, res: Response): Promise<void>;
/** GET /api/admin/petrocards?available=true&search= */
export declare function listPetroCards(req: Request, res: Response): Promise<void>;
/** POST /api/admin/assignments/vehicle  { vehicleId, userId } */
export declare function assignVehicle(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/** DELETE /api/admin/assignments/vehicle/:vehicleId */
export declare function deassignVehicle(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/** POST /api/admin/assignments/petrocard  { cardId, userId } */
export declare function assignCard(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/** DELETE /api/admin/assignments/petrocard/:cardId */
export declare function deassignCard(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=assignment.controller.d.ts.map