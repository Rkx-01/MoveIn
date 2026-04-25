import { AppDataSource } from "../config/database";
import { College } from "../models/College";

export class CollegeRepository {
    private repo = AppDataSource.getRepository(College);

    async findAll(): Promise<College[]> {
        return this.repo.find({ relations: ["city"] });
    }

    async findById(college_id: string): Promise<College | null> {
        return this.repo.findOne({ where: { college_id }, relations: ["city"] });
    }

    async search(query: string): Promise<College[]> {
        return this.repo.createQueryBuilder("college")
            .where("college.name LIKE :query", { query: `%${query}%` })
            .leftJoinAndSelect("college.city", "city")
            .orderBy("college.name", "ASC")
            .limit(10) // Optimization for autocomplete
            .getMany();
    }

    async create(collegeData: Partial<College>): Promise<College> {
        const college = this.repo.create(collegeData);
        return this.repo.save(college);
    }
}
