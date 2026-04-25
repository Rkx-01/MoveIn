import { Request, Response, NextFunction } from "express";
import { CollegeRepository } from "../repositories/CollegeRepository";

const collegeRepository = new CollegeRepository();

export class CollegeController {
    static async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const { q } = req.query;
            let colleges;
            
            if (q) {
                colleges = await collegeRepository.search(q as string);
            } else {
                colleges = await collegeRepository.findAll();
            }
            
            res.status(200).json({ success: true, data: colleges });
        } catch (error) {
            next(error);
        }
    }

    static async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const college = await collegeRepository.findById(id);
            
            if (!college) {
                return res.status(404).json({ success: false, message: "College not found" });
            }
            
            res.status(200).json({ success: true, data: college });
        } catch (error) {
            next(error);
        }
    }
}
