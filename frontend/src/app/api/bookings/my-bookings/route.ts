import { BookingService } from "@/server/services/BookingService";
import { UserRole } from "@/server/models";
import { handler, ok, requireRole } from "@/server/http";

const bookingService = new BookingService();

export const GET = handler(async (request) => {
  const user = requireRole(request, UserRole.TENANT);
  return ok({ data: await bookingService.getBookingsByTenant(user.user_id) });
});
