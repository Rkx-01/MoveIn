import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    CreateDateColumn, 
    OneToOne,
    JoinColumn
} from "typeorm";
import { Booking } from "./Booking";

export enum PaymentStatus {
    PENDING = "Pending",
    COMPLETED = "Completed",
    FAILED = "Failed",
    REFUNDED = "Refunded"
}

@Entity("payments")
export class Payment {
    @PrimaryGeneratedColumn("uuid")
    payment_id!: string;

    @Column("decimal", { precision: 10, scale: 2 })
    amount!: number;

    @Column({
        type: "varchar",
        enum: PaymentStatus,
        default: PaymentStatus.PENDING
    })
    status!: PaymentStatus;

    @OneToOne(() => Booking, (booking) => booking.payment, { onDelete: "CASCADE" })
    @JoinColumn({ name: "booking_id" })
    booking!: Booking;

    @CreateDateColumn()
    created_at!: Date;
}
