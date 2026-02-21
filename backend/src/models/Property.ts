import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    CreateDateColumn, 
    UpdateDateColumn, 
    ManyToOne, 
    OneToMany,
    JoinColumn,
    Index
} from "typeorm";
import { Host } from "./Host";
import { Booking } from "./Booking";
import { City } from "./City";
import { College } from "./College";

export enum PropertyStatus {
    AVAILABLE = "Available",
    BOOKED = "Booked",
    MAINTENANCE = "Maintenance"
}

export enum GenderPreference {
    BOYS = "Boys",
    GIRLS = "Girls",
    CO_LIVING = "Co-Living"
}

@Entity("properties")
export class Property {
    @PrimaryGeneratedColumn("uuid")
    property_id!: string;

    @Column()
    title!: string;

    @Column("text")
    description!: string;

    @Column()
    address!: string;

    @Column({ nullable: true })
    locality!: string;

    @Column("decimal", { precision: 10, scale: 2 })
    price!: number;

    @Column({
        type: "varchar",
        enum: PropertyStatus,
        default: PropertyStatus.AVAILABLE
    })
    status!: PropertyStatus;

    // --- PAN-INDIA LOGISTICS ---
    @Column("decimal", { precision: 10, scale: 8, nullable: true })
    latitude!: number;

    @Column("decimal", { precision: 11, scale: 8, nullable: true })
    longitude!: number;

    @ManyToOne(() => City, (city) => city.properties, { onDelete: "SET NULL" })
    @JoinColumn({ name: "city_id" })
    @Index()
    city!: City;

    @ManyToOne(() => College, { onDelete: "SET NULL" })
    @JoinColumn({ name: "linked_college_id" })
    @Index()
    linked_college!: College;

    // --- STUDENT FIRST PIILARS ---
    @Column({ nullable: true })
    amenities!: string; // JSON string e.g. ["wifi", "food_included", "security"]

    @Column({ default: false })
    roommate_option!: boolean;

    @Column({
        type: "varchar",
        enum: GenderPreference,
        nullable: true
    })
    gender_preference!: GenderPreference;

    // --- SAFETY LAYER ---
    @Column({ default: false })
    is_verified!: boolean;

    @Column("decimal", { precision: 3, scale: 1, nullable: true })
    safety_score!: number;

    @Column({ default: true })
    student_friendly!: boolean;

    @ManyToOne(() => Host, (host) => host.properties, { onDelete: "CASCADE", nullable: true })
    @JoinColumn({ name: "host_id" })
    host!: Host;

    @Column({ nullable: true })
    @Index({ unique: true })
    external_id!: string;

    @Column({ nullable: true })
    external_source!: string;

    @Column("decimal", { precision: 2, scale: 1, nullable: true })
    rating!: number;

    @Column("text", { nullable: true })
    photo_urls!: string; // JSON Array string

    @Column({ type: "datetime", nullable: true })
    last_fetched_at!: Date;

    @OneToMany(() => Booking, (booking) => booking.property)
    bookings!: Booking[];

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
