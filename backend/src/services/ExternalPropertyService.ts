import axios from "axios";
import { AppDataSource } from "../config/database";
import { Property, PropertyStatus, GenderPreference } from "../models/Property";
import { College } from "../models/College";
import { City } from "../models/City";
import { LessThan, In } from "typeorm";

export class ExternalPropertyService {
  private propertyRepo = AppDataSource.getRepository(Property);
  private collegeRepo = AppDataSource.getRepository(College);
  private cityRepo = AppDataSource.getRepository(City);

  // Price ranges by Pune Localities (MVP specific logic)
  private areaPriceEstimates: Record<string, { min: number, max: number }> = {
    "Kothrud": { min: 8000, max: 15000 },
    "Viman Nagar": { min: 10000, max: 18000 },
    "Shivajinagar": { min: 9000, max: 14000 },
    "Baner": { min: 11000, max: 16000 },
    "Wakad": { min: 7000, max: 12000 },
    "Hinjewadi": { min: 6500, max: 11000 }
  };

  // Rotating Premium Stock Images for OSM (Since OSM doesn't provide photos)
  private premiumStockImages = [
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
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"
  ];

  /**
   * Syncs nearby properties from external sources (Google or OSM) and stores them in the DB.
   * Only fetches if no recent cache (< 24h) exists.
   */
  async syncNearbyProperties(collegeId: string): Promise<void> {
    const college = await this.collegeRepo.findOne({ where: { college_id: collegeId }, relations: ["city"] });
    if (!college) return;

    // 1. Check if we already have external results for this college fetched recently
    const cacheExpiry = new Date();
    cacheExpiry.setHours(cacheExpiry.getHours() - 24);

    const existingExternal = await this.propertyRepo.find({
      where: {
        linked_college: { college_id: collegeId },
        external_source: In(["google_places", "openstreetmap"]),
        last_fetched_at: LessThan(cacheExpiry)
      }
    });

    // If cache is fresh, don't re-fetch (Check for > 3 properties to ensure we have a decent feed)
    if (existingExternal.length > 3) {
      console.log(`Using cached real listings for ${college.name}`);
      return;
    }

    const { results, source } = await this.fetchFromExternalSource(college);
    
    console.log(`Syncing ${results.length} listings from ${source} for ${college.name}...`);
    
    // 2. Normalize and Save
    for (const place of results) {
      await this.saveExternalProperty(place, college, source);
    }
  }

  private async fetchFromExternalSource(college: College): Promise<{ results: any[], source: string }> {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    // A. Use Google Places if API Key is present
    if (apiKey && apiKey !== "" && apiKey !== "sk_test_mock_key") {
      try {
        const results = await this.fetchFromGooglePlaces(college, apiKey);
        return { results, source: "google_places" };
      } catch (error) {
        console.error("Google Places Error, falling back to OSM:", error);
      }
    }

    // B. Use OpenStreetMap (Free Alternative)
    try {
      const results = await this.fetchFromOpenStreetMap(college);
      if (results.length > 0) {
        return { results, source: "openstreetmap" };
      }
    } catch (error) {
      console.error("OpenStreetMap Error:", error);
    }

    // C. Fallback to Mock if all else fails
    return { results: this.generateMockPlaces(college), source: "mock" };
  }

  private async fetchFromGooglePlaces(college: College, apiKey: string): Promise<any[]> {
    const { latitude, longitude } = college;
    const radius = 3000;
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&keyword=PG+accommodation+hostel&key=${apiKey}`;
    const response = await axios.get(url);
    return response.data.results || [];
  }

  private async fetchFromOpenStreetMap(college: College): Promise<any[]> {
    const { latitude, longitude } = college;
    const radius = 3000;
    
    // Overpass QL for Hostels and Student Accommodation
    const query = `
      [out:json][timeout:25];
      (
        node["tourism"="hostel"](around:${radius}, ${latitude}, ${longitude});
        node["amenity"="student_accommodation"](around:${radius}, ${latitude}, ${longitude});
        node["building"="dormitory"](around:${radius}, ${latitude}, ${longitude});
        way["tourism"="hostel"](around:${radius}, ${latitude}, ${longitude});
        way["amenity"="student_accommodation"](around:${radius}, ${latitude}, ${longitude});
      );
      out body;
      >;
      out skel qt;
    `;

    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
    const response = await axios.get(url);
    return response.data.elements || [];
  }

  private async saveExternalProperty(place: any, college: College, source: string) {
    const externalId = place.place_id || place.id.toString();
    
    // Check if duplicate
    const existing = await this.propertyRepo.findOne({ where: { external_id: externalId } });
    if (existing) {
        await this.propertyRepo.update(existing.property_id, { last_fetched_at: new Date() });
        return;
    }

    // Normalization Mapping
    let title, address, lat, lon, rating, photos;

    if (source === "google_places") {
      title = place.name;
      address = place.vicinity || place.formatted_address;
      lat = place.geometry.location.lat;
      lon = place.geometry.location.lng;
      rating = place.rating;
      // Fallback to stock images as photo_references require API keys in frontend
      photos = [this.premiumStockImages[Math.floor(Math.random() * this.premiumStockImages.length)]];
    } else if (source === "openstreetmap") {
      title = place.tags?.name || `Student Accommodation near ${college.name}`;
      address = place.tags?.["addr:street"] 
        ? `${place.tags["addr:housenumber"] || ""} ${place.tags["addr:street"]}, ${place.tags["addr:suburb"] || college.area}`
        : `${college.area}, Pune`;
      lat = place.lat || (place.center ? place.center.lat : college.latitude);
      lon = place.lon || (place.center ? place.center.lon : college.longitude);
      rating = 4.2; // Default for OSM as it lacks ratings
      photos = [this.premiumStockImages[Math.floor(Math.random() * this.premiumStockImages.length)]];
    } else {
      // Mock data handling
      title = place.name;
      address = place.vicinity;
      lat = place.geometry.location.lat;
      lon = place.geometry.location.lng;
      rating = place.rating;
      photos = [this.premiumStockImages[Math.floor(Math.random() * this.premiumStockImages.length)]];
    }

    const price = this.estimatePrice(college.area || "Pune");
    
    const property = this.propertyRepo.create({
      title,
      description: `Premium student housing in the heart of ${college.area}. Perfect for ${college.name} students.`,
      address: address || "Address available on request",
      locality: college.area,
      price,
      status: PropertyStatus.AVAILABLE,
      latitude: lat,
      longitude: lon,
      city: college.city,
      linked_college: college,
      is_verified: false,
      safety_score: rating ? parseFloat(rating.toString()) * 2 : 8.0,
      rating: parseFloat(rating?.toString() || "4.0"),
      external_id: externalId,
      external_source: source,
      last_fetched_at: new Date(),
      student_friendly: true,
      gender_preference: GenderPreference.CO_LIVING,
      amenities: JSON.stringify(["wifi", "security", "community"]),
      photo_urls: JSON.stringify(photos)
    });

    try {
      await this.propertyRepo.save(property);
    } catch (e) {
      // Handle unique constraint failures gracefully
      console.error("Error saving external property:", title);
    }
  }

  private estimatePrice(area: string): number {
    const range = this.areaPriceEstimates[area] || { min: 6000, max: 12000 };
    return Math.floor(Math.random() * (range.max - range.min + 1) + range.min);
  }

  private generateMockPlaces(college: College): any[] {
    return [0,1,2,3,4].map(i => ({
      place_id: `mock_${college.college_id}_${i}`,
      name: `Premium Stay ${i+1} near ${college.name}`,
      vicinity: `${college.area}, Pune`,
      rating: (Math.random() * (5 - 3.8) + 3.8).toFixed(1),
      geometry: {
        location: {
          lat: parseFloat(college.latitude.toString()) + (Math.random() - 0.5) * 0.02,
          lng: parseFloat(college.longitude.toString()) + (Math.random() - 0.5) * 0.02
        }
      }
    }));
  }
}
