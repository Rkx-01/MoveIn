import { query, queryOne } from "../db";
import type { City } from "../models";

export class CityRepository {
  async findAll(): Promise<City[]> {
    return query<City>(`SELECT * FROM cities ORDER BY name ASC`);
  }

  async findById(city_id: string): Promise<City | null> {
    return queryOne<City>(`SELECT * FROM cities WHERE city_id = $1`, [city_id]);
  }

  async create(data: Partial<City>): Promise<City> {
    const row = await queryOne<City>(
      `INSERT INTO cities (name, state, latitude, longitude, tier)
       VALUES ($1, $2, $3, $4, COALESCE($5, 'Tier 1'))
       RETURNING *`,
      [data.name, data.state, data.latitude, data.longitude, data.tier ?? null]
    );
    return row as City;
  }
}
