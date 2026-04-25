import { PropertyRepository } from "../repositories/PropertyRepository";
import { UserRepository } from "../repositories/UserRepository";
import { CollegeRepository } from "../repositories/CollegeRepository";
import { Property, PropertyStatus } from "../models/Property";
import { Host } from "../models/Host";
import { UserRole } from "../models/User";
import { ExternalPropertyService } from "./ExternalPropertyService";

export class PropertyService {
    private propertyRepository = new PropertyRepository();
    private userRepository = new UserRepository();
    private collegeRepository = new CollegeRepository();
    private externalPropertyService = new ExternalPropertyService();

    async createProperty(hostId: string, data: Partial<Property>): Promise<Property> {
        const user = await this.userRepository.findById(hostId);
        
        if (!user || user.role !== UserRole.HOST) {
            throw new Error("Unauthorized: Only hosts can create properties"); // Checking polymorphic role validation
        }

        return this.propertyRepository.create(data, user as Host);
    }

    async getAllAvailableProperties(filters?: any): Promise<{ items: any[]; total: number }> {
        // Prepare geo credentials if college is selected
        if (filters && filters.college_id) {
            const college = await this.collegeRepository.findById(filters.college_id);
            if (college) {
                filters.college_lat = college.latitude;
                filters.college_lon = college.longitude;

                // TRIGGER EXTERNAL SYNC (Async, don't wait to keep response fast)
                // This will populate the DB with real listings near the college
                this.externalPropertyService.syncNearbyProperties(filters.college_id)
                    .catch(err => console.error("External Sync Failed:", err));
            }
        }

        const { items, total } = await this.propertyRepository.findAll(filters);
        
        // Filter by status (Status is handled at service level or could be moved to repository)
        const available = items.filter(p => p.status === PropertyStatus.AVAILABLE);

        return { items: available, total };
    }

    async getPropertyDetails(propertyId: string): Promise<Property | null> {
        return this.propertyRepository.findById(propertyId);
    }

    async getPropertiesByHost(hostId: string): Promise<Property[]> {
        return this.propertyRepository.findByHost(hostId);
    }
    
    // Deleting / Updating properties would go here
}
