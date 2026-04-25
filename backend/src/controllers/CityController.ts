import { Request, Response, NextFunction } from "express";
import { CityRepository } from "../repositories/CityRepository";

const cityRepository = new CityRepository();

export class CityController {
    static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const cities = await cityRepository.findAll();
            res.status(200).json({ success: true, data: cities });
        } catch (error) {
            next(error);
        }
    }

    static async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const city = await cityRepository.findById(id);
            
            if (!city) {
                return res.status(404).json({ success: false, message: "City not found" });
            }
            
            res.status(200).json({ success: true, data: city });
        } catch (error) {
            next(error);
        }
    }
}
