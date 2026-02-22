import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository';
import { UserRole } from '../models/User';

export class AuthService {
    private userRepository = new UserRepository();
    private readonly JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';

    async registerUser(data: any): Promise<any> {
        const { name, email, password, role } = data;
        
        // Check existing user
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            throw new Error("Email already registered");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userData = { name, email, password: hashedPassword };

        let user;
        switch(role) {
            case UserRole.TENANT:
                user = await this.userRepository.createTenant(userData);
                break;
            case UserRole.HOST:
                user = await this.userRepository.createHost(userData);
                break;
            case UserRole.ADMIN:
                user = await this.userRepository.createAdmin(userData);
                break;
            default:
                throw new Error("Invalid role specified");
        }

        return this.generateTokenResponse(user);
    }

    async login(email: string, password: string): Promise<any> {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error("Invalid credentials");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error("Invalid credentials");
        }

        return this.generateTokenResponse(user);
    }

    private generateTokenResponse(user: any) {
        const payload = {
            user_id: user.user_id,
            role: user.role,
        };

        const token = jwt.sign(payload, this.JWT_SECRET, { expiresIn: '1d' });
        
        return {
            token,
            user: {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        };
    }
}
