import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    CreateDateColumn, 
    UpdateDateColumn, 
    TableInheritance 
} from "typeorm";

export enum UserRole {
    TENANT = "Tenant",
    HOST = "Host",
    ADMIN = "Admin"
}

@Entity("users")
@TableInheritance({ column: { type: "varchar", name: "role" } })
export abstract class User {
    @PrimaryGeneratedColumn("uuid")
    user_id!: string;

    @Column()
    name!: string;

    @Column({ unique: true })
    email!: string;

    @Column()
    password!: string;

    @Column({
        type: "varchar",
        enum: UserRole
    })
    role!: UserRole;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    // Common abstracted methods could be placed here if utilizing Data Mapper or Active Record
}
