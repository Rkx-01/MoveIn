import catalog from "./staticCatalog.json";
import {
  type City,
  type College,
  type Property,
  type PropertyFilters,
  PropertyStatus,
} from "../models";

/**
 * Read-only catalogue served when no database is configured.
 *
 * A deploy without DATABASE_URL used to return HTTP 500 from every route, so
 * the site rendered an empty shell. The snapshot in staticCatalog.json (see
 * `npm run export:catalog`) lets the browse experience work standalone —
 * the real OpenStreetMap stays included.
 *
 * Only reads are covered. Anything that writes — registering, logging in,
 * booking — genuinely needs a database and still fails loudly rather than
 * pretending to succeed.
 */
export const isStaticMode = (): boolean => !process.env.DATABASE_URL;

export const staticCounts = catalog.counts;
export const staticGeneratedAt = catalog.generatedAt;

const CITIES = catalog.cities as unknown as City[];
const COLLEGES = catalog.colleges as unknown as College[];
const PROPERTIES = catalog.properties as unknown as Property[];

/** Great-circle distance in km — the JS twin of the SQL `acos` expression. */
const distanceKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const value =
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lon2) - toRad(lon1)) +
    Math.sin(toRad(lat1)) * Math.sin(toRad(lat2));
  return 6371 * Math.acos(Math.min(1, Math.max(-1, value)));
};

const includesCI = (haystack: string | null | undefined, needle: string): boolean =>
  (haystack ?? "").toLowerCase().includes(needle.toLowerCase());

export const staticFindProperties = (
  filters: PropertyFilters = {}
): { items: Property[]; total: number } => {
  const page = Math.max(parseInt(filters.page ?? "1", 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(filters.limit ?? "12", 10) || 12, 1), 100);
  const offset = (page - 1) * limit;

  let matched = PROPERTIES.filter((p) => p.status === PropertyStatus.AVAILABLE);

  if (filters.college_id) {
    matched = matched.filter((p) => p.linked_college_id === filters.college_id);
  }
  if (filters.search) {
    const term = filters.search;
    matched = matched.filter(
      (p) => includesCI(p.title, term) || includesCI(p.address, term)
    );
  }
  if (filters.student_friendly) {
    matched = matched.filter((p) => p.student_friendly === true);
  }
  if (filters.is_verified) {
    matched = matched.filter((p) => p.is_verified === true);
  }
  if (filters.gender_preference) {
    matched = matched.filter((p) => p.gender_preference === filters.gender_preference);
  }
  if (filters.min_budget) {
    matched = matched.filter((p) => Number(p.price) >= Number(filters.min_budget));
  }
  if (filters.max_budget) {
    matched = matched.filter((p) => Number(p.price) <= Number(filters.max_budget));
  }
  if (filters.city_id) {
    matched = matched.filter((p) => p.city_id === filters.city_id);
  }
  if (filters.amenities) {
    for (const amenity of filters.amenities.split(",").filter(Boolean)) {
      matched = matched.filter((p) => includesCI(p.amenities, amenity));
    }
  }

  // Total reflects the full match set, before pagination — same as the SQL.
  const total = matched.length;

  const college = filters.college_id
    ? COLLEGES.find((c) => c.college_id === filters.college_id)
    : undefined;

  if (college) {
    const withDistance = matched.map((p) => ({
      ...p,
      distance_to_college:
        p.latitude === null || p.longitude === null
          ? null
          : distanceKm(
              Number(college.latitude),
              Number(college.longitude),
              Number(p.latitude),
              Number(p.longitude)
            ),
    }));
    // ASC, NULLS LAST
    withDistance.sort((a, b) => {
      if (a.distance_to_college === null) return b.distance_to_college === null ? 0 : 1;
      if (b.distance_to_college === null) return -1;
      return a.distance_to_college - b.distance_to_college;
    });
    matched = withDistance;
  } else {
    matched = [...matched].sort((a, b) => {
      if (a.is_verified !== b.is_verified) return a.is_verified ? -1 : 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }

  return { items: matched.slice(offset, offset + limit), total };
};

export const staticFindPropertyById = (property_id: string): Property | null =>
  PROPERTIES.find((p) => p.property_id === property_id) ?? null;

export const staticFindColleges = (): College[] => COLLEGES;

export const staticFindCollegeById = (college_id: string): College | null =>
  COLLEGES.find((c) => c.college_id === college_id) ?? null;

export const staticSearchColleges = (term: string): College[] =>
  COLLEGES.filter((c) => includesCI(c.name, term) || includesCI(c.area, term));

export const staticFindCities = (): City[] => CITIES;

export const staticFindCityById = (city_id: string): City | null =>
  CITIES.find((c) => c.city_id === city_id) ?? null;
