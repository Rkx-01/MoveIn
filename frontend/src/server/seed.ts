import bcrypt from "bcryptjs";
import { getPool, query, queryOne } from "./db";
import { ensureSchema } from "./schema";
import { MASTER_CITIES, MASTER_COLLEGES } from "./data/masterData";
import {
  type City,
  type College,
  CollegeType,
  GenderPreference,
  PropertyStatus,
  UserRole,
} from "./models";

const randomOffset = () => (Math.random() - 0.5) * 0.01; // ~1km jitter

const PROPERTY_TITLES = [
  "Premium Student PG",
  "Safe Home Stay",
  "Modern Hostel Pod",
  "Sharing Apartment for Students",
  "Co-Living Space",
  "Budget Study Loft",
];

const AMENITIES_POOL = ["wifi", "food", "security", "laundry", "ro_water", "ac", "power_backup"];

const PHOTO_POOL = [
  "/properties/room1.jpg",
  "/properties/room2.jpg",
  "/properties/room3.jpg",
  "/properties/room4.jpg",
  "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800",
  "https://images.unsplash.com/photo-1502672260266-1c1de2d93688?w=800",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800",
  "https://images.unsplash.com/photo-1554995207-c18c20360a59?w=800",
  "https://images.unsplash.com/photo-1536376074432-8d2a3ea56f4d?w=800",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
  "https://images.unsplash.com/photo-1505691938895-1758d7eaa511?w=800",
  "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
];

const pick = <T>(list: T[]): T => list[Math.floor(Math.random() * list.length)];

export interface SeedSummary {
  cities: number;
  colleges: number;
  properties: number;
  users: number;
}

export interface SeedOptions {
  /**
   * Generate the five demo stays per college. These are invented, not real
   * places, and exist so the audited-listing UI has something to render on a
   * fresh database. Turn them off to run the catalogue on genuinely external
   * listings alone (see `npm run import:stays`).
   */
  includeDemoProperties?: boolean;
}

/**
 * Rebuilds the Pune MVP dataset from scratch. Destructive by design: it clears
 * bookings/payments/reviews/properties/colleges/cities/users first so repeated
 * runs converge on the same state (the Express `seedIndia` script did the same).
 */
export const runSeed = async (
  { includeDemoProperties = true }: SeedOptions = {}
): Promise<SeedSummary> => {
  await ensureSchema();
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query(
      `TRUNCATE payments, bookings, reviews, properties, colleges, cities, users RESTART IDENTITY CASCADE`
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  // 1. Cities
  const cityByName = new Map<string, City>();
  for (const c of MASTER_CITIES) {
    const city = await queryOne<City>(
      `INSERT INTO cities (name, state, latitude, longitude, tier)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [c.name, c.state, c.lat, c.lon, c.tier]
    );
    cityByName.set(c.name, city as City);
  }

  // 2. Colleges
  const colleges: College[] = [];
  for (const c of MASTER_COLLEGES) {
    const college = await queryOne<College>(
      `INSERT INTO colleges (name, type, area, latitude, longitude, city_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        c.name,
        c.type as CollegeType,
        c.area,
        c.lat,
        c.lon,
        cityByName.get(c.city)?.city_id ?? null,
      ]
    );
    colleges.push(college as College);
  }

  // 3. Users — one verified host who owns the seeded stock, plus a test tenant.
  const hashedPassword = await bcrypt.hash("password123", 10);

  const host = await queryOne<{ user_id: string }>(
    `INSERT INTO users (name, email, password, role, phone_number, verified_host)
     VALUES ($1, $2, $3, $4, $5, true) RETURNING user_id`,
    ["MoveIn Pune Host", "host@movein.pune", hashedPassword, UserRole.HOST, "+91 20 2567 1234"]
  );

  await query(
    `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)`,
    ["John Doe", "john@gmail.com", hashedPassword, UserRole.TENANT]
  );

  // 4. Five demo properties per college, unless the caller opted out.
  let propertyCount = 0;
  for (const college of includeDemoProperties ? colleges : []) {
    for (let i = 0; i < 5; i++) {
      const title = pick(PROPERTY_TITLES);
      const price = Math.floor(Math.random() * (20000 - 6000) + 6000);
      const gender = pick([
        GenderPreference.BOYS,
        GenderPreference.GIRLS,
        GenderPreference.CO_LIVING,
      ]);
      const amenities = [...AMENITIES_POOL].sort(() => 0.5 - Math.random()).slice(0, 5);

      await query(
        `INSERT INTO properties (
           title, description, address, locality, price, status,
           latitude, longitude, city_id, linked_college_id, amenities,
           photo_urls, is_verified, safety_score, student_friendly,
           gender_preference, roommate_option, host_id
         ) VALUES (
           $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
           $12, true, $13, true, $14, $15, $16
         )`,
        [
          `${title} near ${college.name}`,
          `Verified student housing located in the heart of ${college.area}, Pune. Designed for students of ${college.name}. Safe, clean, and study-friendly environment.`,
          `Building ${10 + i}, Lane ${i + 1}, ${college.area}, Pune`,
          college.area,
          price,
          PropertyStatus.AVAILABLE,
          Number(college.latitude) + randomOffset(),
          Number(college.longitude) + randomOffset(),
          college.city_id,
          college.college_id,
          JSON.stringify(amenities),
          JSON.stringify([pick(PHOTO_POOL)]),
          parseFloat((Math.random() * (9.9 - 8.8) + 8.8).toFixed(1)),
          gender,
          Math.random() > 0.3,
          host!.user_id,
        ]
      );
      propertyCount++;
    }
  }

  return {
    cities: cityByName.size,
    colleges: colleges.length,
    properties: propertyCount,
    users: 2,
  };
};
