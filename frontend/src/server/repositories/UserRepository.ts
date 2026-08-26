import { queryOne } from "../db";
import { type Admin, type Host, type Tenant, type User, UserRole } from "../models";

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return queryOne<User>(`SELECT * FROM users WHERE email = $1`, [email]);
  }

  async findById(user_id: string): Promise<User | null> {
    return queryOne<User>(`SELECT * FROM users WHERE user_id = $1`, [user_id]);
  }

  private async insert(
    data: { name: string; email: string; password: string },
    role: UserRole
  ): Promise<User> {
    const row = await queryOne<User>(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.name, data.email, data.password, role]
    );
    return row as User;
  }

  async createTenant(data: { name: string; email: string; password: string }): Promise<Tenant> {
    return this.insert(data, UserRole.TENANT);
  }

  async createHost(data: { name: string; email: string; password: string }): Promise<Host> {
    return this.insert(data, UserRole.HOST) as Promise<Host>;
  }

  async createAdmin(data: { name: string; email: string; password: string }): Promise<Admin> {
    return this.insert(data, UserRole.ADMIN) as Promise<Admin>;
  }
}
