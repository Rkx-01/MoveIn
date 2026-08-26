import { query, queryOne } from "../db";
import { type Booking, type Payment, PaymentStatus } from "../models";

/**
 * Stands in for a real gateway (Stripe/Razorpay).
 *
 * The Express version resolved after a 1s setTimeout to fake network latency.
 * That does not survive a serverless function returning, so the delay is gone
 * and the payment resolves inline — the booking's final status is therefore
 * known before the response is sent.
 */
export class PaymentService {
  async processSimulatedPayment(booking: Booking, amount: number): Promise<Payment> {
    const pending = await queryOne<Payment>(
      `INSERT INTO payments (booking_id, amount, status)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [booking.booking_id, amount, PaymentStatus.PENDING]
    );

    const status = Math.random() > 0.1 ? PaymentStatus.COMPLETED : PaymentStatus.FAILED;

    const settled = await queryOne<Payment>(
      `UPDATE payments SET status = $2 WHERE payment_id = $1 RETURNING *`,
      [pending!.payment_id, status]
    );

    return settled as Payment;
  }

  async getPaymentByBooking(bookingId: string): Promise<Payment | null> {
    return queryOne<Payment>(`SELECT * FROM payments WHERE booking_id = $1`, [bookingId]);
  }

  async deleteByBooking(bookingId: string): Promise<void> {
    await query(`DELETE FROM payments WHERE booking_id = $1`, [bookingId]);
  }
}
