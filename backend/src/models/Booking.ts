import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    CreateDateColumn, 
    UpdateDateColumn, 
    ManyToOne, 
    OneToOne,
    JoinColumn
} from "typeorm";
import { Tenant } from "./Tenant";
import { Property } from "./Property";
import { Payment } from "./Payment";

export enum BookingStatus {
    PENDING = "Pending",
    CONFIRMED = "Confirmed",
    CANCELLED = "Cancelled"
}

@Entity("bookings")
export class Booking {
    @PrimaryGeneratedColumn("uuid")
    booking_id!: string;

    @Column("date")
    start_date!: Date;

    @Column("date")
    end_date!: Date;

    @Column({
        type: "varchar",
        enum: BookingStatus,
        default: BookingStatus.PENDING
    })
    status!: BookingStatus;

    @ManyToOne(() => Tenant, (tenant) => tenant.bookings, { onDelete: "CASCADE" })
    @JoinColumn({ name: "tenant_id" })
    tenant!: Tenant;

    @ManyToOne(() => Property, (property) => property.bookings, { onDelete: "CASCADE" })
    @JoinColumn({ name: "property_id" })
    property!: Property;

    @OneToOne(() => Payment, (payment) => payment.booking, { cascade: true })
    payment!: Payment;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
