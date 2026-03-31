import { AppDataSource } from "../config/database";
import { User, UserRole } from "../models/User";
import { Tenant } from "../models/Tenant";
import { Host } from "../models/Host";
import { Admin } from "../models/Admin";

export class UserRepository {
    private baseRepo = AppDataSource.getRepository(User);
    private tenantRepo = AppDataSource.getRepository(Tenant);
    private hostRepo = AppDataSource.getRepository(Host);
    private adminRepo = AppDataSource.getRepository(Admin);

    async findByEmail(email: string): Promise<User | null> {
        return this.baseRepo.findOneBy({ email });
    }

    async findById(user_id: string): Promise<User | null> {
        return this.baseRepo.findOneBy({ user_id });
    }

    async createTenant(data: Partial<Tenant>): Promise<Tenant> {
        const tenant = this.tenantRepo.create({ ...data, role: UserRole.TENANT });
        return this.tenantRepo.save(tenant);
    }

    async createHost(data: Partial<Host>): Promise<Host> {
        const host = this.hostRepo.create({ ...data, role: UserRole.HOST });
        return this.hostRepo.save(host);
    }

    async createAdmin(data: Partial<Admin>): Promise<Admin> {
        const admin = this.adminRepo.create({ ...data, role: UserRole.ADMIN });
        return this.adminRepo.save(admin);
    }
}
