import { ChildEntity, Column } from "typeorm";
import { User, UserRole } from "./User";

@ChildEntity(UserRole.ADMIN)
export class Admin extends User {
    // Admin specific properties if any
    @Column({ default: true })
    super_admin!: boolean;
}
