import { LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { AppDataSource } from "../config/database";
import { Booking, BookingStatus } from "../models/Booking";
import { Property } from "../models/Property";
import { Tenant } from "../models/Tenant";

export class BookingRepository {
    private repo = AppDataSource.getRepository(Booking);

    async findById(booking_id: string): Promise<Booking | null> {
        return this.repo.findOne({ where: { booking_id }, relations: ["property", "tenant", "payment"] });
    }

    async checkAvailability(property_id: string, startDate: Date, endDate: Date): Promise<boolean> {
        // Find any booking that overlaps with the requested dates and is NOT cancelled
        const overlappingBookings = await this.repo.createQueryBuilder("booking")
            .where("booking.property_id = :propertyId", { propertyId: property_id })
            .andWhere("booking.status != :cancelled", { cancelled: BookingStatus.CANCELLED })
            .andWhere(
                "(booking.start_date <= :endDate AND booking.end_date >= :startDate)",
                { startDate, endDate }
            )
            .getCount();

        return overlappingBookings === 0;
    }

    async create(tenant: Tenant, property: Property, startDate: Date, endDate: Date): Promise<Booking> {
        const booking = this.repo.create({
            tenant,
            property,
            start_date: startDate,
            end_date: endDate,
            status: BookingStatus.PENDING
        });
        return this.repo.save(booking);
    }

    async updateStatus(booking_id: string, status: BookingStatus): Promise<void> {
        await this.repo.update(booking_id, { status });
    }

    async findByTenant(tenant_id: string): Promise<Booking[]> {
        return this.repo.find({ where: { tenant: { user_id: tenant_id } }, relations: ["property"] });
    }
}
