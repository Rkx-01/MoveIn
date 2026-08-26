import { query, queryOne } from "../db";
import {
  isStaticMode,
  staticFindProperties,
  staticFindPropertyById,
} from "../data/staticStore";
import {
  type Property,
  type PropertyFilters,
  PropertyStatus,
} from "../models";

/** Columns plus the joined city/host/college objects the UI reads. */
const SELECT_PROPERTY = `
  p.*,
  CASE WHEN c.city_id IS NULL THEN NULL ELSE json_build_object(
    'city_id', c.city_id, 'name', c.name, 'state', c.state,
    'latitude', c.latitude, 'longitude', c.longitude, 'tier', c.tier
  ) END AS city,
  CASE WHEN h.user_id IS NULL THEN NULL ELSE json_build_object(
    'user_id', h.user_id, 'name', h.name,
    'phone_number', h.phone_number, 'verified_host', h.verified_host
  ) END AS host,
  CASE WHEN col.college_id IS NULL THEN NULL ELSE json_build_object(
    'college_id', col.college_id, 'name', col.name, 'area', col.area
  ) END AS linked_college
`;

const FROM_PROPERTY = `
  FROM properties p
  LEFT JOIN cities   c   ON c.city_id       = p.city_id
  LEFT JOIN users    h   ON h.user_id       = p.host_id
  LEFT JOIN colleges col ON col.college_id  = p.linked_college_id
`;

export class PropertyRepository {
  async findAll(
    filters: PropertyFilters = {}
  ): Promise<{ items: Property[]; total: number }> {
    if (isStaticMode()) return staticFindProperties(filters);

    const page = Math.max(parseInt(filters.page ?? "1", 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(filters.limit ?? "12", 10) || 12, 1), 100);
    const offset = (page - 1) * limit;

    const where: string[] = [];
    const params: unknown[] = [];
    const push = (value: unknown) => `$${params.push(value)}`;

    // Only ever surface bookable stock — this was a post-query filter in the
    // Express service, which silently corrupted the pagination totals.
    where.push(`p.status = ${push(PropertyStatus.AVAILABLE)}`);

    let distanceSql: string | null = null;
    if (filters.college_id) {
      where.push(`p.linked_college_id = ${push(filters.college_id)}`);
    }

    if (filters.search) {
      const term = push(`%${filters.search}%`);
      where.push(`(p.title ILIKE ${term} OR p.address ILIKE ${term})`);
    }
    if (filters.student_friendly) {
      where.push(`p.student_friendly = true`);
    }
    if (filters.is_verified) {
      where.push(`p.is_verified = true`);
    }
    if (filters.gender_preference) {
      where.push(`p.gender_preference = ${push(filters.gender_preference)}`);
    }
    if (filters.min_budget) {
      where.push(`p.price >= ${push(filters.min_budget)}`);
    }
    if (filters.max_budget) {
      where.push(`p.price <= ${push(filters.max_budget)}`);
    }
    if (filters.city_id) {
      where.push(`p.city_id = ${push(filters.city_id)}`);
    }
    if (filters.amenities) {
      for (const amenity of filters.amenities.split(",").filter(Boolean)) {
        where.push(`p.amenities ILIKE ${push(`%${amenity}%`)}`);
      }
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    // Count before any non-WHERE parameters are appended, so the placeholder
    // numbering in `whereSql` still lines up with `params`.
    const totalRow = await queryOne<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM properties p ${whereSql}`,
      [...params]
    );
    const total = parseInt(totalRow?.count ?? "0", 10);

    // Resolve the college coordinates for distance sorting, if requested.
    if (filters.college_id) {
      const college = await queryOne<{ latitude: number; longitude: number }>(
        `SELECT latitude, longitude FROM colleges WHERE college_id = $1`,
        [filters.college_id]
      );
      if (college) {
        const lat = push(college.latitude);
        const lon = push(college.longitude);
        distanceSql = `(6371 * acos(LEAST(1, GREATEST(-1,
          cos(radians(${lat})) * cos(radians(p.latitude)) *
          cos(radians(p.longitude) - radians(${lon})) +
          sin(radians(${lat})) * sin(radians(p.latitude))
        ))))`;
      }
    }

    const orderSql = distanceSql
      ? `ORDER BY distance_to_college ASC NULLS LAST`
      : `ORDER BY p.is_verified DESC, p.created_at DESC`;

    const items = await query<Property>(
      `SELECT ${SELECT_PROPERTY}
       ${distanceSql ? `, ${distanceSql} AS distance_to_college` : ""}
       ${FROM_PROPERTY}
       ${whereSql}
       ${orderSql}
       LIMIT ${push(limit)} OFFSET ${push(offset)}`,
      params
    );

    return { items, total };
  }

  async findById(property_id: string): Promise<Property | null> {
    if (isStaticMode()) return staticFindPropertyById(property_id);

    return queryOne<Property>(
      `SELECT ${SELECT_PROPERTY} ${FROM_PROPERTY} WHERE p.property_id = $1`,
      [property_id]
    );
  }

  async findByHost(host_id: string): Promise<Property[]> {
    return query<Property>(
      `SELECT ${SELECT_PROPERTY} ${FROM_PROPERTY}
       WHERE p.host_id = $1
       ORDER BY p.created_at DESC`,
      [host_id]
    );
  }

  async create(data: Partial<Property>, hostId: string): Promise<Property> {
    const row = await queryOne<Property>(
      `INSERT INTO properties (
         title, description, address, locality, price, status,
         latitude, longitude, city_id, linked_college_id, amenities,
         roommate_option, gender_preference, is_verified, safety_score,
         student_friendly, host_id, photo_urls
       ) VALUES (
         $1, $2, $3, $4, $5, COALESCE($6, 'Available'),
         $7, $8, $9, $10, $11,
         COALESCE($12, false), $13, COALESCE($14, false), $15,
         COALESCE($16, true), $17, $18
       )
       RETURNING *`,
      [
        data.title,
        data.description,
        data.address,
        data.locality ?? null,
        data.price,
        data.status ?? null,
        data.latitude ?? null,
        data.longitude ?? null,
        data.city_id ?? null,
        data.linked_college_id ?? null,
        data.amenities ?? null,
        data.roommate_option ?? null,
        data.gender_preference ?? null,
        data.is_verified ?? null,
        data.safety_score ?? null,
        data.student_friendly ?? null,
        hostId,
        data.photo_urls ?? null,
      ]
    );
    return row as Property;
  }

  async updateStatus(property_id: string, status: PropertyStatus): Promise<void> {
    await query(
      `UPDATE properties SET status = $2, updated_at = now() WHERE property_id = $1`,
      [property_id, status]
    );
  }

  async findByExternalId(external_id: string): Promise<Property | null> {
    return queryOne<Property>(
      `SELECT * FROM properties WHERE external_id = $1`,
      [external_id]
    );
  }

  async countFreshExternal(collegeId: string, since: Date): Promise<number> {
    const row = await queryOne<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM properties
       WHERE linked_college_id = $1
         AND external_source IN ('google_places', 'openstreetmap')
         AND last_fetched_at >= $2`,
      [collegeId, since]
    );
    return parseInt(row?.count ?? "0", 10);
  }

  async touchExternal(property_id: string): Promise<void> {
    await query(
      `UPDATE properties SET last_fetched_at = now(), updated_at = now()
       WHERE property_id = $1`,
      [property_id]
    );
  }

  async insertExternal(data: Partial<Property>): Promise<void> {
    await query(
      `INSERT INTO properties (
         title, description, address, locality, price, status,
         latitude, longitude, city_id, linked_college_id, is_verified,
         safety_score, rating, external_id, external_source, last_fetched_at,
         student_friendly, gender_preference, amenities, photo_urls
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
         $12, $13, $14, $15, now(), $16, $17, $18, $19
       )
       ON CONFLICT (external_id) DO NOTHING`,
      [
        data.title,
        data.description,
        data.address,
        data.locality ?? null,
        data.price,
        data.status ?? PropertyStatus.AVAILABLE,
        data.latitude ?? null,
        data.longitude ?? null,
        data.city_id ?? null,
        data.linked_college_id ?? null,
        data.is_verified ?? false,
        data.safety_score ?? null,
        data.rating ?? null,
        data.external_id,
        data.external_source,
        data.student_friendly ?? true,
        data.gender_preference ?? null,
        data.amenities ?? null,
        data.photo_urls ?? null,
      ]
    );
  }
}
