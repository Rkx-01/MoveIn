import { ChildEntity, OneToMany, Column } from "typeorm";
import { User, UserRole } from "./User";
import { Property } from "./Property";

@ChildEntity(UserRole.HOST)
export class Host extends User {
    @Column({ nullable: true })
    phone_number!: string;

    @Column({ default: false })
    verified_host!: boolean;

    // A host can manage many properties
    @OneToMany(() => Property, (property) => property.host)
    properties!: Property[];
}
