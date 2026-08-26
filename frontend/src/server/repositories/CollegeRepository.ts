import { query, queryOne } from "../db";
import type { College } from "../models";

const SELECT_COLLEGE = `
  col.*,
  CASE WHEN c.city_id IS NULL THEN NULL ELSE json_build_object(
    'city_id', c.city_id, 'name', c.name, 'state', c.state,
    'latitude', c.latitude, 'longitude', c.longitude, 'tier', c.tier
  ) END AS city
  FROM colleges col
  LEFT JOIN cities c ON c.city_id = col.city_id
`;

export class CollegeRepository {
  async findAll(): Promise<College[]> {
    return query<College>(`SELECT ${SELECT_COLLEGE} ORDER BY col.name ASC`);
  }

  async findById(college_id: string): Promise<College | null> {
    return queryOne<College>(
      `SELECT ${SELECT_COLLEGE} WHERE col.college_id = $1`,
      [college_id]
    );
  }

  async search(term: string): Promise<College[]> {
    return query<College>(
      `SELECT ${SELECT_COLLEGE}
       WHERE col.name ILIKE $1
       ORDER BY col.name ASC
       LIMIT 10`,
      [`%${term}%`]
    );
  }

  async create(data: Partial<College>): Promise<College> {
    const row = await queryOne<College>(
      `INSERT INTO colleges (name, type, area, latitude, longitude, city_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [data.name, data.type, data.area ?? null, data.latitude, data.longitude, data.city_id ?? null]
    );
    return row as College;
  }
}
