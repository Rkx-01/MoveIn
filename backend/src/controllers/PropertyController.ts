import { Request, Response, NextFunction } from "express";
import { PropertyService } from "../services/PropertyService";

const propertyService = new PropertyService();

export class PropertyController {
    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            const hostId = req.user?.user_id; 
            if (!hostId) throw new Error("User not found in request");
            const property = await propertyService.createProperty(hostId, req.body);
            res.status(201).json({ success: true, data: property });
        } catch (error) {
            next(error);
        }
    }

    static async getAvailable(req: Request, res: Response, next: NextFunction) {
        try {
            const { items, total } = await propertyService.getAllAvailableProperties(req.query);
            res.status(200).json({ 
                success: true, 
                data: items,
                meta: {
                    total,
                    page: parseInt(req.query.page as string) || 1,
                    limit: parseInt(req.query.limit as string) || 12
                }
            });
        } catch (error) {
            next(error);
        }
    }

    static async getDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const property = await propertyService.getPropertyDetails(req.params.id);
            if (!property) return res.status(404).json({ success: false, message: "Not found" });
            res.status(200).json({ success: true, data: property });
        } catch (error) {
            next(error);
        }
    }
}
