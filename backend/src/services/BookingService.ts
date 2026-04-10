import { BookingRepository } from "../repositories/BookingRepository";
import { PropertyRepository } from "../repositories/PropertyRepository";
import { UserRepository } from "../repositories/UserRepository";
import { Booking, BookingStatus } from "../models/Booking";
import { UserRole } from "../models/User";
import { Tenant } from "../models/Tenant";
import { PaymentService } from "./PaymentService";
import { PaymentStatus } from "../models/Payment";

export class BookingService {
    private bookingRepository = new BookingRepository();
    private propertyRepository = new PropertyRepository();
    private userRepository = new UserRepository();
    private paymentService = new PaymentService();

    async createBooking(tenantId: string, propertyId: string, startDateStr: string, endDateStr: string): Promise<Booking> {
        const user = await this.userRepository.findById(tenantId);
        if (!user || user.role !== UserRole.TENANT) {
            throw new Error("Only tenants can book properties");
        }

        const property = await this.propertyRepository.findById(propertyId);
        if (!property) {
            throw new Error("Property not found");
        }

        const startDate = new Date(startDateStr);
        const endDate = new Date(endDateStr);

        if (startDate >= endDate) {
            throw new Error("End date must be after start date");
        }

        // 1. Check availability logic (STRICT)
        const isAvailable = await this.bookingRepository.checkAvailability(propertyId, startDate, endDate);
        if (!isAvailable) {
            throw new Error("Double Booking Prevention: Property is already booked for these dates.");
        }

        // 2. Create the booking in PENDING state
        const booking = await this.bookingRepository.create(user as Tenant, property, startDate, endDate);
        console.log(`[BOOKING] Created: ${booking.booking_id} (PENDING)`);

        // 3. Process Payment (SIMULATED)
        // Note: In a real-world frontend, this would be a separate step with a client-side redirect.
        // For this production-lite system, we simulate the backend-to-payment lifecycle.
        this.paymentService.processSimulatedPayment(booking, property.price).then(async (payment) => {
            if (payment.status === PaymentStatus.COMPLETED) {
                await this.bookingRepository.updateStatus(booking.booking_id, BookingStatus.CONFIRMED);
            } else {
                await this.bookingRepository.updateStatus(booking.booking_id, BookingStatus.CANCELLED);
            }
        });

        return booking;
    }

    async getBookingsByTenant(tenantId: string): Promise<Booking[]> {
        return this.bookingRepository.findByTenant(tenantId);
    }
}
