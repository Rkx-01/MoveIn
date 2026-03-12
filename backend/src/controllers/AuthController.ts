import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/AuthService";

const authService = new AuthService();

export class AuthController {
    static async register(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await authService.registerUser(req.body);
            // In a real app we might set an HttpOnly cookie
            res.status(201).json({ success: true, ...data });
        } catch (error) {
            next(error); // Pass to error handler
        }
    }

    static async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;
            const data = await authService.login(email, password);
            res.status(200).json({ success: true, ...data });
        } catch (error) {
            next(error);
        }
    }
}
