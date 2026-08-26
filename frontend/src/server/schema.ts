import { getPool } from "./db";

/**
 * Schema bootstrap.
 *
 * Replaces TypeORM's `synchronize: true`. Every statement is idempotent, so it
 * is safe to run on a cold start or re-run against an already-populated
 * database. Mirrors the entity relationships documented in ErDiagram.md.
 *
 * `users` uses single-table inheritance keyed on `role`, matching the original
 * @TableInheritance/@ChildEntity setup: Host and Admin columns live on the same
 * table and are simply NULL for the other roles.
 */
const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS cities (
     city_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     name      varchar NOT NULL,
     state     varchar NOT NULL,
     latitude  numeric(10, 8) NOT NULL,
     longitude numeric(11, 8) NOT NULL,
     tier      varchar NOT NULL DEFAULT 'Tier 1'
   )`,

  `CREATE TABLE IF NOT EXISTS colleges (
     college_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     name       varchar NOT NULL,
     type       varchar NOT NULL DEFAULT 'Other',
     area       varchar,
     latitude   numeric(10, 8) NOT NULL,
     longitude  numeric(11, 8) NOT NULL,
     city_id    uuid REFERENCES cities(city_id) ON DELETE CASCADE
   )`,
  `CREATE INDEX IF NOT EXISTS idx_colleges_city ON colleges(city_id)`,

  `CREATE TABLE IF NOT EXISTS users (
     user_id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     name          varchar NOT NULL,
     email         varchar NOT NULL UNIQUE,
     password      varchar NOT NULL,
     role          varchar NOT NULL,
     phone_number  varchar,
     verified_host boolean NOT NULL DEFAULT false,
     super_admin   boolean NOT NULL DEFAULT true,
     created_at    timestamptz NOT NULL DEFAULT now(),
     updated_at    timestamptz NOT NULL DEFAULT now()
   )`,

  `CREATE TABLE IF NOT EXISTS properties (
     property_id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     title             varchar NOT NULL,
     description       text NOT NULL,
     address           varchar NOT NULL,
     locality          varchar,
     price             numeric(10, 2) NOT NULL,
     status            varchar NOT NULL DEFAULT 'Available',
     latitude          numeric(10, 8),
     longitude         numeric(11, 8),
     city_id           uuid REFERENCES cities(city_id) ON DELETE SET NULL,
     linked_college_id uuid REFERENCES colleges(college_id) ON DELETE SET NULL,
     amenities         varchar,
     roommate_option   boolean NOT NULL DEFAULT false,
     gender_preference varchar,
     is_verified       boolean NOT NULL DEFAULT false,
     safety_score      numeric(3, 1),
     student_friendly  boolean NOT NULL DEFAULT true,
     host_id           uuid REFERENCES users(user_id) ON DELETE CASCADE,
     external_id       varchar,
     external_source   varchar,
     rating            numeric(2, 1),
     photo_urls        text,
     last_fetched_at   timestamptz,
     created_at        timestamptz NOT NULL DEFAULT now(),
     updated_at        timestamptz NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city_id)`,
  `CREATE INDEX IF NOT EXISTS idx_properties_college ON properties(linked_college_id)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_properties_external_id ON properties(external_id)`,

  `CREATE TABLE IF NOT EXISTS bookings (
     booking_id  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     start_date  date NOT NULL,
     end_date    date NOT NULL,
     status      varchar NOT NULL DEFAULT 'Pending',
     tenant_id   uuid REFERENCES users(user_id) ON DELETE CASCADE,
     property_id uuid REFERENCES properties(property_id) ON DELETE CASCADE,
     created_at  timestamptz NOT NULL DEFAULT now(),
     updated_at  timestamptz NOT NULL DEFAULT now()
   )`,

  `CREATE TABLE IF NOT EXISTS payments (
     payment_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     amount     numeric(10, 2) NOT NULL,
     status     varchar NOT NULL DEFAULT 'Pending',
     booking_id uuid UNIQUE REFERENCES bookings(booking_id) ON DELETE CASCADE,
     created_at timestamptz NOT NULL DEFAULT now()
   )`,

  `CREATE TABLE IF NOT EXISTS reviews (
     review_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     comment     text NOT NULL,
     rating      numeric(2, 1) NOT NULL,
     author_id   uuid REFERENCES users(user_id) ON DELETE CASCADE,
     property_id uuid REFERENCES properties(property_id) ON DELETE CASCADE,
     created_at  timestamptz NOT NULL DEFAULT now()
   )`,
];

// One bootstrap per lambda instance, not per request.
declare global {
  // eslint-disable-next-line no-var
  var __moveinSchemaReady: Promise<void> | undefined;
}

const bootstrap = async (): Promise<void> => {
  const pool = getPool();
  for (const statement of STATEMENTS) {
    await pool.query(statement);
  }
};

export const ensureSchema = (): Promise<void> => {
  if (!global.__moveinSchemaReady) {
    global.__moveinSchemaReady = bootstrap().catch((error) => {
      // Don't cache a failed bootstrap — the next request should retry.
      global.__moveinSchemaReady = undefined;
      throw error;
    });
  }
  return global.__moveinSchemaReady;
};
