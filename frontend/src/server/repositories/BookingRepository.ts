import { query, queryOne } from "../db";
import { type Booking, BookingStatus } from "../models";

export class BookingRepository {
  async findById(booking_id: string): Promise<Booking | null> {
    return queryOne<Booking>(`SELECT * FROM bookings WHERE booking_id = $1`, [booking_id]);
  }

  /** True when no non-cancelled booking overlaps the requested window. */
  async checkAvailability(
    property_id: string,
    startDate: Date,
    endDate: Date
  ): Promise<boolean> {
    const row = await queryOne<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM bookings
       WHERE property_id = $1
         AND status <> $2
         AND start_date <= $4
         AND end_date   >= $3`,
      [property_id, BookingStatus.CANCELLED, startDate, endDate]
    );
    return parseInt(row?.count ?? "0", 10) === 0;
  }

  async create(
    tenant_id: string,
    property_id: string,
    startDate: Date,
    endDate: Date
  ): Promise<Booking> {
    const row = await queryOne<Booking>(
      `INSERT INTO bookings (tenant_id, property_id, start_date, end_date, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [tenant_id, property_id, startDate, endDate, BookingStatus.PENDING]
    );
    return row as Booking;
  }

  async updateStatus(booking_id: string, status: BookingStatus): Promise<void> {
    await query(
      `UPDATE bookings SET status = $2, updated_at = now() WHERE booking_id = $1`,
      [booking_id, status]
    );
  }

  async findByTenant(tenant_id: string): Promise<Booking[]> {
    return query<Booking>(
      `SELECT b.*, to_jsonb(p.*) AS property
       FROM bookings b
       LEFT JOIN properties p ON p.property_id = b.property_id
       WHERE b.tenant_id = $1
       ORDER BY b.created_at DESC`,
      [tenant_id]
    );
  }
}
