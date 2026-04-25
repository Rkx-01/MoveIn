import { AppDataSource } from "../config/database";
import { City } from "../models/City";

export class CityRepository {
    private repo = AppDataSource.getRepository(City);

    async findAll(): Promise<City[]> {
        return this.repo.find();
    }

    async findById(city_id: string): Promise<City | null> {
        return this.repo.findOneBy({ city_id });
    }

    async create(cityData: Partial<City>): Promise<City> {
        const city = this.repo.create(cityData);
        return this.repo.save(city);
    }
}
