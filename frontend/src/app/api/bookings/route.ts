import { BookingService } from "@/server/services/BookingService";
import { UserRole } from "@/server/models";
import { handler, ok, requireRole } from "@/server/http";

const bookingService = new BookingService();

export const POST = handler(async (request) => {
  const user = requireRole(request, UserRole.TENANT);
  const { property_id, start_date, end_date } = await request.json();
  const booking = await bookingService.createBooking(
    user.user_id,
    property_id,
    start_date,
    end_date
  );
  return ok({ data: booking }, { status: 201 });
});
