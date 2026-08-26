/**
 * Snapshots the current database into a static catalogue file.
 *
 * `npm run export:catalog`
 *
 * The result is committed to the repo and served by the read APIs whenever
 * DATABASE_URL is absent, so a deploy with no database still shows the real
 * catalogue. Re-run it whenever the imported stays change.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { getPool, query } from "../server/db";

const OUTPUT = resolve(process.cwd(), "src/server/data/staticCatalog.json");

const run = async () => {
  const cities = await query(`SELECT * FROM cities ORDER BY name`);
  const colleges = await query(`SELECT * FROM colleges ORDER BY name`);

  // Mirror the shape PropertyRepository returns, including the joined objects
  // the UI reads. Host credentials are deliberately not part of the join.
  const properties = await query(`
    SELECT p.*,
      CASE WHEN c.city_id IS NULL THEN NULL ELSE json_build_object(
        'city_id', c.city_id, 'name', c.name, 'state', c.state,
        'latitude', c.latitude, 'longitude', c.longitude, 'tier', c.tier
      ) END AS city,
      CASE WHEN h.user_id IS NULL THEN NULL ELSE json_build_object(
        'user_id', h.user_id, 'name', h.name,
        'phone_number', h.phone_number, 'verified_host', h.verified_host
      ) END AS host,
      CASE WHEN col.college_id IS NULL THEN NULL ELSE json_build_object(
        'college_id', col.college_id, 'name', col.name, 'area', col.area
      ) END AS linked_college
    FROM properties p
    LEFT JOIN cities   c   ON c.city_id      = p.city_id
    LEFT JOIN users    h   ON h.user_id      = p.host_id
    LEFT JOIN colleges col ON col.college_id = p.linked_college_id
    ORDER BY p.created_at
  `);

  const catalog = {
    generatedAt: new Date().toISOString(),
    counts: {
      cities: cities.length,
      colleges: colleges.length,
      properties: properties.length,
      realProperties: properties.filter(
        (p: Record<string, unknown>) => p.external_source !== null
      ).length,
    },
    cities,
    colleges,
    properties,
  };

  mkdirSync(dirname(OUTPUT), { recursive: true });
  writeFileSync(OUTPUT, JSON.stringify(catalog, null, 1));
  console.log(`Wrote ${OUTPUT}`);
  console.log(catalog.counts);
};

run()
  .then(async () => {
    await getPool().end();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Export failed:", error);
    await getPool().end();
    process.exit(1);
  });
