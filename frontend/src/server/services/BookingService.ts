import { BookingRepository } from "../repositories/BookingRepository";
import { PropertyRepository } from "../repositories/PropertyRepository";
import { UserRepository } from "../repositories/UserRepository";
import { PaymentService } from "./PaymentService";
import { type Booking, BookingStatus, PaymentStatus, UserRole } from "../models";

export class BookingService {
  private bookingRepository = new BookingRepository();
  private propertyRepository = new PropertyRepository();
  private userRepository = new UserRepository();
  private paymentService = new PaymentService();

  async createBooking(
    tenantId: string,
    propertyId: string,
    startDateStr: string,
    endDateStr: string
  ): Promise<Booking> {
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

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      throw new Error("Invalid booking dates");
    }
    if (startDate >= endDate) {
      throw new Error("End date must be after start date");
    }

    const isAvailable = await this.bookingRepository.checkAvailability(
      propertyId,
      startDate,
      endDate
    );
    if (!isAvailable) {
      throw new Error("Double Booking Prevention: Property is already booked for these dates.");
    }

    const booking = await this.bookingRepository.create(
      tenantId,
      propertyId,
      startDate,
      endDate
    );

    // Settle payment inline so the caller sees the resolved status.
    const payment = await this.paymentService.processSimulatedPayment(booking, property.price);
    const finalStatus =
      payment.status === PaymentStatus.COMPLETED
        ? BookingStatus.CONFIRMED
        : BookingStatus.CANCELLED;

    await this.bookingRepository.updateStatus(booking.booking_id, finalStatus);

    return { ...booking, status: finalStatus };
  }

  async getBookingsByTenant(tenantId: string): Promise<Booking[]> {
    return this.bookingRepository.findByTenant(tenantId);
  }
}
