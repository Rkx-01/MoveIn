import { AppDataSource } from "../config/database";
import { Property, PropertyStatus } from "../models/Property";
import { Host } from "../models/Host";

export class PropertyRepository {
    private repo = AppDataSource.getRepository(Property);

    async findAll(filters?: any): Promise<{ items: any[]; total: number }> {
        const query = this.repo.createQueryBuilder("property")
            .leftJoinAndSelect("property.host", "host")
            .leftJoinAndSelect("property.city", "city");

        const page = parseInt(filters?.page) || 1;
        const limit = parseInt(filters?.limit) || 12;
        const skip = (page - 1) * limit;

        // If college_id is provided, we need its coordinates for distance
        let college_coords = null;
        if (filters?.college_id && filters?.college_lat && filters?.college_lon) {
            college_coords = { lat: parseFloat(filters.college_lat), lon: parseFloat(filters.college_lon) };
            
            // Simple distance approximation for SQLite (which lacks math functions like acos/cos by default)
            const distanceSql = process.env.DB_TYPE === "sqlite"
                ? `(ABS(property.latitude - ${college_coords.lat}) + ABS(property.longitude - ${college_coords.lon}))`
                : `(6371 * acos(cos(radians(${college_coords.lat})) * cos(radians(property.latitude)) * cos(radians(property.longitude) - radians(${college_coords.lon})) + sin(radians(${college_coords.lat})) * sin(radians(property.latitude))))`;
            
            query.addSelect(distanceSql, "distance_to_college");
            query.andWhere("property.linked_college_id = :collegeId", { collegeId: filters.college_id });
        }

        if (filters?.search) {
            query.andWhere("(property.title LIKE :search OR property.address LIKE :search)", { search: `%${filters.search}%` });
        }
        if (filters?.student_friendly) {
            query.andWhere("property.student_friendly = :sf", { sf: true });
        }
        if (filters?.is_verified) {
            query.andWhere("property.is_verified = :iv", { iv: true });
        }
        if (filters?.gender_preference) {
            query.andWhere("property.gender_preference = :gp", { gp: filters.gender_preference });
        }
        if (filters?.min_budget) {
            query.andWhere("property.price >= :min_price", { min_price: filters.min_budget });
        }
        if (filters?.max_budget) {
            query.andWhere("property.price <= :max_price", { max_price: filters.max_budget });
        }
        if (filters?.city_id) {
            query.andWhere("property.city_id = :cityId", { cityId: filters.city_id });
        }
        
        if (filters?.amenities) {
            const amenitiesArray = filters.amenities.split(',');
            amenitiesArray.forEach((amenity: string, index: number) => {
                query.andWhere(`property.amenities LIKE :amenity${index}`, { [`amenity${index}`]: `%${amenity}%` });
            });
        }

        // Apply sorting
        if (college_coords) {
            query.orderBy("distance_to_college", "ASC");
        } else {
            query.orderBy("property.is_verified", "DESC")
                 .addOrderBy("property.created_at", "DESC");
        }

        const [items, total] = await query
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        // TypeORM doesn't automatically include the virtual distance field in the entity object for getMany
        // We need to use getRawAndEntities if we want that behavior or manually map it
        if (college_coords) {
            const rawResults = await query.getRawMany();
            const itemsWithDist = items.map(item => {
                const raw = rawResults.find(r => r.property_property_id === item.property_id);
                return { ...item, distance_to_college: raw ? parseFloat(raw.distance_to_college) : null };
            });
            return { items: itemsWithDist, total };
        }

        return { items, total };
    }

    async findById(property_id: string): Promise<Property | null> {
        return this.repo.findOne({ where: { property_id }, relations: ["host"] });
    }

    async findByHost(host_id: string): Promise<Property[]> {
        return this.repo.find({ where: { host: { user_id: host_id } }, relations: ["host"] });
    }

    async create(propertyData: Partial<Property>, host: Host): Promise<Property> {
        const property = this.repo.create({ ...propertyData, host });
        return this.repo.save(property);
    }

    async updateStatus(property_id: string, status: PropertyStatus): Promise<void> {
        await this.repo.update(property_id, { status });
    }
}
