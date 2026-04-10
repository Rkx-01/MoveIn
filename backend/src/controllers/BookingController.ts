import { Request, Response, NextFunction } from "express";
import { BookingService } from "../services/BookingService";

const bookingService = new BookingService();

export class BookingController {
    static async create(req: Request, res: Response, next: NextFunction) {
        try {
            // @ts-ignore
            const tenantId = req.user.user_id;
            const { property_id, start_date, end_date } = req.body;
            
            const booking = await bookingService.createBooking(tenantId, property_id, start_date, end_date);
            res.status(201).json({ success: true, data: booking });
        } catch (error) {
            next(error);
        }
    }

    static async getTenantBookings(req: Request, res: Response, next: NextFunction) {
        try {
            // @ts-ignore
            const tenantId = req.user.user_id;
            const bookings = await bookingService.getBookingsByTenant(tenantId);
            res.status(200).json({ success: true, data: bookings });
        } catch (error) {
            next(error);
        }
    }
}
