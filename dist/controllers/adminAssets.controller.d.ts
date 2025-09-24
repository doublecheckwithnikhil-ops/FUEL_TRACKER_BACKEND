import { Request, Response } from "express";
export declare function listVehicles(req: Request, res: Response): Promise<void>;
export declare function getVehicle(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function createVehicle(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function updateVehicle(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function deleteVehicle(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function listCards(req: Request, res: Response): Promise<void>;
export declare function getCard(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function createCard(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function updateCard(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function deleteCard(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=adminAssets.controller.d.ts.map