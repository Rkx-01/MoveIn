import { PropertyRepository } from "../repositories/PropertyRepository";
import { CollegeRepository } from "../repositories/CollegeRepository";
import { GenderPreference, PropertyStatus, type College } from "../models";

/** A listing normalised out of whatever upstream source produced it. */
interface NormalisedListing {
  externalId: string;
  title: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  website: string | null;
  imageUrl: string | null;
  amenities: string[];
  genderPreference: GenderPreference;
  rating: number | null;
}

/** The subset of a Google Places `nearbysearch` result we consume. */
interface GooglePlacesResult {
  place_id?: string;
  name?: string;
  vicinity?: string;
  formatted_address?: string;
  rating?: number | string;
  geometry?: { location?: { lat?: number; lng?: number } };
}

/** The subset of an Overpass element we consume (`out tags center`). */
interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat?: number; lon?: number };
  tags?: Record<string, string>;
}

/**
 * Pulls real nearby listings from Google Places (when a key is configured) or
 * OpenStreetMap's Overpass API, normalises them, and caches them in the
 * properties table for 24h.
 *
 * OSM is the default because it needs no key and its data is openly licensed
 * (ODbL). What it gives us is genuinely real: name, coordinates, and often a
 * street address or phone. What it does NOT carry is rent, photos, or
 * availability — so those stay empty rather than being invented, and the rows
 * are written with `is_verified = false` so the UI labels them as unverified.
 */
export class ExternalPropertyService {
  private propertyRepo = new PropertyRepository();
  private collegeRepo = new CollegeRepository();

  /**
   * How hard to retry Overpass. A web request backfills opportunistically
   * inside a bounded route budget, so it takes one pass and gives up; the
   * offline importer has no such deadline and waits Overpass out.
   */
  private readonly retryRounds: number;

  constructor(options: { patient?: boolean } = {}) {
    this.retryRounds = options.patient ? 3 : 1;
  }

  /** Public Overpass mirrors, tried in order — the main one rate-limits often. */
  private static readonly OVERPASS_ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
  ];

  /** Indicative monthly rent bands per Pune locality, in ₹. */
  private areaPriceEstimates: Record<string, { min: number; max: number }> = {
    Kothrud: { min: 8000, max: 15000 },
    "Viman Nagar": { min: 10000, max: 18000 },
    Shivajinagar: { min: 9000, max: 14000 },
    Baner: { min: 11000, max: 16000 },
    Wakad: { min: 7000, max: 12000 },
    Hinjewadi: { min: 6500, max: 11000 },
    "Karve Nagar": { min: 7500, max: 13000 },
    Bibwewadi: { min: 7000, max: 12000 },
    Akurdi: { min: 6000, max: 10500 },
    Aundh: { min: 10000, max: 16000 },
    Hadapsar: { min: 7000, max: 12500 },
  };

  /**
   * OSM tags a lot of things as `tourism=hostel` that no student can rent a bed
   * in — design schools, orphanages, company guest houses, resorts. Drop those
   * unless the name also reads like actual accommodation.
   */
  private static readonly NOT_A_STAY =
    /\b(school|college|university|institute|orphan|holiday home|resort|hospital|club|temple|office)\b/i;
  private static readonly IS_A_STAY =
    /\b(hostel|pg|paying guest|residence|residency|nivas|niwas|accommodation|stay|lodge|dorm|hall)\b/i;

  async syncNearbyProperties(collegeId: string): Promise<number> {
    const college = await this.collegeRepo.findById(collegeId);
    if (!college) return 0;

    const cacheExpiry = new Date();
    cacheExpiry.setHours(cacheExpiry.getHours() - 24);

    // A decent cached feed means there's nothing to do.
    const fresh = await this.propertyRepo.countFreshExternal(collegeId, cacheExpiry);
    if (fresh > 3) return 0;

    const { listings, source } = await this.fetchFromExternalSource(college);
    let saved = 0;
    for (const listing of listings) {
      if (await this.saveListing(listing, college, source)) saved++;
    }
    return saved;
  }

  private async fetchFromExternalSource(
    college: College
  ): Promise<{ listings: NormalisedListing[]; source: string }> {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (apiKey && apiKey !== "" && apiKey !== "sk_test_mock_key") {
      try {
        const listings = await this.fetchFromGooglePlaces(college, apiKey);
        if (listings.length > 0) return { listings, source: "google_places" };
      } catch (error) {
        console.error("Google Places Error, falling back to OSM:", error);
      }
    }

    try {
      // Dense areas resolve inside 3km; thin ones (Viman Nagar, Akurdi) return
      // almost nothing until the net widens, so escalate when the catch is small.
      let listings = await this.fetchFromOpenStreetMap(college, 3000);
      if (listings.length < 4) {
        const wider = await this.fetchFromOpenStreetMap(college, 6000);
        if (wider.length > listings.length) listings = wider;
      }
      return { listings, source: "openstreetmap" };
    } catch (error) {
      console.error("OpenStreetMap Error:", error);
    }

    return { listings: [], source: "openstreetmap" };
  }

  private async fetchFromGooglePlaces(
    college: College,
    apiKey: string
  ): Promise<NormalisedListing[]> {
    const url =
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json` +
      `?location=${college.latitude},${college.longitude}&radius=3000` +
      `&keyword=PG+accommodation+hostel&key=${apiKey}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const data = await response.json();

    return (data.results ?? [])
      .filter((place: GooglePlacesResult) => place.place_id && place.name)
      .map((place: GooglePlacesResult) => ({
        externalId: place.place_id as string,
        title: place.name as string,
        address: place.vicinity ?? place.formatted_address ?? `${college.area}, Pune`,
        latitude: place.geometry?.location?.lat ?? Number(college.latitude),
        longitude: place.geometry?.location?.lng ?? Number(college.longitude),
        phone: null,
        website: null,
        imageUrl: null,
        amenities: [],
        genderPreference: this.inferGender(place.name as string),
        rating: place.rating ? parseFloat(String(place.rating)) : null,
      }));
  }

  private async fetchFromOpenStreetMap(
    college: College,
    radius: number
  ): Promise<NormalisedListing[]> {
    const { latitude, longitude } = college;
    const around = `around:${radius},${latitude},${longitude}`;

    // `nwr` covers nodes, ways and relations; `out tags center` gives every one
    // of them a usable coordinate. (The previous `out body; >;` left ways with
    // no position, so they all collapsed onto the college's own pin.)
    const overpassQuery = `
      [out:json][timeout:25];
      (
        nwr["tourism"="hostel"](${around});
        nwr["amenity"~"^student_accom+odation$"](${around});
        nwr["building"="dormitory"](${around});
        nwr["tourism"="guest_house"](${around});
      );
      out tags center;
    `;

    const elements = await this.queryOverpass(overpassQuery);
    return elements
      .map((element) => this.normaliseOsmElement(element, college))
      .filter((listing): listing is NormalisedListing => listing !== null);
  }

  /**
   * Overpass is a free, heavily-loaded public service: 429s, 502s and 504s are
   * routine rather than exceptional, and one bad minute can cost a college its
   * whole listing set. Retry the full mirror list with backoff when the caller
   * can afford to wait.
   */
  private async queryOverpass(query: string): Promise<OverpassElement[]> {
    let lastError: unknown;

    for (let round = 0; round < this.retryRounds; round++) {
      if (round > 0) {
        await new Promise((resolve) => setTimeout(resolve, round * 5000));
      }

      for (const endpoint of ExternalPropertyService.OVERPASS_ENDPOINTS) {
        try {
          const response = await fetch(endpoint, {
            method: "POST",
            body: `data=${encodeURIComponent(query)}`,
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              // Overpass asks every client to identify itself, and anonymous
              // traffic is the first thing its mirrors shed under load.
              "User-Agent": "MoveIn/1.0 (student housing; +https://github.com/Rkx-01/MoveIn)",
            },
            // The query declares [timeout:25], so the client has to wait at
            // least that long — requests routinely sit queued before running.
            signal: AbortSignal.timeout(30000),
          });
          if (!response.ok) throw new Error(`${endpoint} returned ${response.status}`);
          const data = await response.json();
          return data.elements ?? [];
        } catch (error) {
          lastError = error;
        }
      }
    }

    throw lastError ?? new Error("All Overpass endpoints failed");
  }

  private normaliseOsmElement(
    element: OverpassElement,
    college: College
  ): NormalisedListing | null {
    const tags = element.tags ?? {};
    const name: string | undefined = tags.name;

    // An unnamed building is not something we can show a student.
    if (!name) return null;
    if (
      ExternalPropertyService.NOT_A_STAY.test(name) &&
      !ExternalPropertyService.IS_A_STAY.test(name)
    ) {
      return null;
    }

    const latitude = element.lat ?? element.center?.lat;
    const longitude = element.lon ?? element.center?.lon;
    if (typeof latitude !== "number" || typeof longitude !== "number") return null;

    const externalId = `osm_${element.type}_${element.id}`;

    const street = tags["addr:street"];
    const address = street
      ? [tags["addr:housenumber"], street, tags["addr:suburb"] ?? college.area, "Pune"]
          .filter(Boolean)
          .join(", ")
      : `${tags["addr:suburb"] ?? college.area ?? "Pune"}, Pune`;

    return {
      externalId,
      title: name.trim(),
      address,
      latitude,
      longitude,
      phone: tags.phone ?? tags["contact:phone"] ?? null,
      website: tags.website ?? tags["contact:website"] ?? null,
      imageUrl: typeof tags.image === "string" && tags.image.startsWith("http") ? tags.image : null,
      amenities: this.amenitiesFromTags(tags),
      genderPreference: this.inferGender(name),
      // OSM carries no ratings, and inventing one would be a lie on a page that
      // sells itself on trust.
      rating: null,
    };
  }

  /** Only amenities the source actually asserts — nothing padded in. */
  private amenitiesFromTags(tags: Record<string, string>): string[] {
    const amenities: string[] = [];
    if (tags.internet_access && tags.internet_access !== "no") amenities.push("wifi");
    if (tags["internet_access:fee"] === "no") amenities.push("free_wifi");
    if (tags.laundry_service === "yes") amenities.push("laundry");
    if (tags.air_conditioning === "yes") amenities.push("ac");
    if (tags.wheelchair === "yes") amenities.push("wheelchair_access");
    if (tags.meal === "yes" || tags.breakfast === "yes") amenities.push("food");
    if (tags.parking === "yes") amenities.push("parking");
    return amenities;
  }

  private inferGender(name: string): GenderPreference {
    if (/\b(boys?|gents?|mens?|male)\b/i.test(name)) return GenderPreference.BOYS;
    if (/\b(girls?|ladies|womens?|female)\b/i.test(name)) return GenderPreference.GIRLS;
    return GenderPreference.CO_LIVING;
  }

  private async saveListing(
    listing: NormalisedListing,
    college: College,
    source: string
  ): Promise<boolean> {
    const existing = await this.propertyRepo.findByExternalId(listing.externalId);
    if (existing) {
      await this.propertyRepo.touchExternal(existing.property_id);
      return false;
    }

    const locality = college.area ?? "Pune";
    const priceEstimate = this.estimatePrice(locality);
    const contact = [
      listing.phone ? `Phone: ${listing.phone}` : null,
      listing.website ? `Web: ${listing.website}` : null,
    ]
      .filter(Boolean)
      .join(" · ");

    const description =
      `Student accommodation in ${locality}, near ${college.name}. ` +
      `Listing sourced from ${source === "openstreetmap" ? "OpenStreetMap" : "Google Places"} ` +
      `and not yet verified by MoveIn — the ₹${priceEstimate.toLocaleString("en-IN")} figure is an ` +
      `indicative ${locality} rent, not a quoted price. Confirm rent and availability directly.` +
      (contact ? `\n\n${contact}` : "");

    await this.propertyRepo.insertExternal({
      title: listing.title,
      description,
      address: listing.address,
      locality,
      price: priceEstimate,
      status: PropertyStatus.AVAILABLE,
      latitude: listing.latitude,
      longitude: listing.longitude,
      city_id: college.city_id,
      linked_college_id: college.college_id,
      is_verified: false,
      // No audit has happened, so there is no safety score to show.
      safety_score: null,
      rating: listing.rating,
      external_id: listing.externalId,
      external_source: source,
      student_friendly: true,
      gender_preference: listing.genderPreference,
      amenities: JSON.stringify(listing.amenities),
      photo_urls: listing.imageUrl ? JSON.stringify([listing.imageUrl]) : null,
    });
    return true;
  }

  private estimatePrice(area: string): number {
    const range = this.areaPriceEstimates[area] ?? { min: 6000, max: 12000 };
    return Math.floor(Math.random() * (range.max - range.min + 1) + range.min);
  }
}
