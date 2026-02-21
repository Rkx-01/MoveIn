import { ChildEntity, OneToMany } from "typeorm";
import { User, UserRole } from "./User";
import { Booking } from "./Booking";

@ChildEntity(UserRole.TENANT)
export class Tenant extends User {
    // A tenant can have many bookings
    @OneToMany(() => Booking, (booking) => booking.tenant)
    bookings!: Booking[];
}
