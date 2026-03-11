import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    ManyToOne, 
    JoinColumn,
    Index
} from "typeorm";
import { City } from "./City";

export enum CollegeType {
    ENGINEERING = "Engineering",
    UNIVERSITY = "University",
    PRIVATE = "Private",
    MEDICAL = "Medical",
    LAW = "Law",
    IIT = "IIT",
    OTHER = "Other"
}

@Entity("colleges")
export class College {
    @PrimaryGeneratedColumn("uuid")
    college_id!: string;

    @Column()
    name!: string;

    @Column({
        type: "varchar",
        enum: CollegeType,
        default: CollegeType.OTHER
    })
    type!: CollegeType;

    @Column({ nullable: true })
    area!: string;

    @Column("decimal", { precision: 10, scale: 8 })
    latitude!: number;

    @Column("decimal", { precision: 11, scale: 8 })
    longitude!: number;

    @ManyToOne(() => City, (city) => city.colleges, { onDelete: "CASCADE" })
    @JoinColumn({ name: "city_id" })
    @Index()
    city!: City;
}
