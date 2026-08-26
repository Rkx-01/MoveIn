import { PropertyRepository } from "../repositories/PropertyRepository";
import { UserRepository } from "../repositories/UserRepository";
import { CollegeRepository } from "../repositories/CollegeRepository";
import { ExternalPropertyService } from "./ExternalPropertyService";
import { isStaticMode } from "../data/staticStore";
import { type Property, type PropertyFilters, UserRole } from "../models";

export class PropertyService {
  private propertyRepository = new PropertyRepository();
  private userRepository = new UserRepository();
  private collegeRepository = new CollegeRepository();
  private externalPropertyService = new ExternalPropertyService();

  async createProperty(hostId: string, data: Partial<Property>): Promise<Property> {
    const user = await this.userRepository.findById(hostId);
    if (!user || user.role !== UserRole.HOST) {
      throw new Error("Unauthorized: Only hosts can create properties");
    }
    return this.propertyRepository.create(data, hostId);
  }

  /**
   * Availability filtering happens in SQL (see PropertyRepository), so `total`
   * matches the rows actually returned and pagination stays correct.
   */
  async getAllAvailableProperties(
    filters: PropertyFilters = {}
  ): Promise<{ items: Property[]; total: number }> {
    return this.propertyRepository.findAll(filters);
  }

  /**
   * Backfills real listings near a college from Google Places / OSM.
   *
   * Called from the route handler inside `after()` so it runs once the response
   * has been flushed — the Express version used a floating promise, which a
   * serverless function would kill the moment it returned.
   */
  async syncExternalForCollege(collegeId: string): Promise<void> {
    // Without a database there is nowhere to cache new listings, and the
    // static catalogue is already a snapshot of a completed import.
    if (isStaticMode()) return;

    const college = await this.collegeRepository.findById(collegeId);
    if (!college) return;
    await this.externalPropertyService.syncNearbyProperties(collegeId);
  }

  async getPropertyDetails(propertyId: string): Promise<Property | null> {
    return this.propertyRepository.findById(propertyId);
  }

  async getPropertiesByHost(hostId: string): Promise<Property[]> {
    return this.propertyRepository.findByHost(hostId);
  }
}
