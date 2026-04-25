import { UserRole } from "../models/User";

declare global {
    namespace Express {
        interface Request {
            user?: {
                user_id: string;
                role: UserRole;
                email: string;
            };
        }
    }
}
