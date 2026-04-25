import { AppDataSource } from "../config/database";
import { Payment, PaymentStatus } from "../models/Payment";
import { Booking } from "../models/Booking";

export class PaymentService {
    private paymentRepo = AppDataSource.getRepository(Payment);

    /**
     * Simulates a production payment gateway interaction.
     * In a real system, this would call Stripe/Razorpay.
     */
    async processSimulatedPayment(booking: Booking, amount: number): Promise<Payment> {
        console.log(`[PAYMENT] Processing ₹${amount} for booking ${booking.booking_id}...`);
        
        // Create initial pending payment record
        const payment = this.paymentRepo.create({
            booking,
            amount,
            status: PaymentStatus.PENDING
        });
        await this.paymentRepo.save(payment);

        // Simulation logic: 90% success rate
        const isSuccess = Math.random() > 0.1;
        
        return new Promise((resolve) => {
            setTimeout(async () => {
                if (isSuccess) {
                    payment.status = PaymentStatus.COMPLETED;
                    console.log(`[PAYMENT] Transaction Successful: ${payment.payment_id}`);
                } else {
                    payment.status = PaymentStatus.FAILED;
                    console.log(`[PAYMENT] Transaction Failed: ${payment.payment_id}`);
                }
                
                const finalPayment = await this.paymentRepo.save(payment);
                resolve(finalPayment);
            }, 1000); // Simulate network latency
        });
    }

    async getPaymentByBooking(bookingId: string): Promise<Payment | null> {
        return this.paymentRepo.findOne({ where: { booking: { booking_id: bookingId } } });
    }
}
