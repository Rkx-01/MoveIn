import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    OneToMany 
} from "typeorm";
import { Property } from "./Property";
import { College } from "./College";

@Entity("cities")
export class City {
    @PrimaryGeneratedColumn("uuid")
    city_id!: string;

    @Column()
    name!: string;

    @Column()
    state!: string;

    @Column("decimal", { precision: 10, scale: 8 })
    latitude!: number;

    @Column("decimal", { precision: 11, scale: 8 })
    longitude!: number;

    @Column({ default: "Tier 1" })
    tier!: string;

    @OneToMany(() => Property, (property) => property.city)
    properties!: Property[];

    @OneToMany(() => College, (college) => college.city)
    colleges!: College[];
}
