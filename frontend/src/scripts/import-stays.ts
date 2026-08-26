/**
 * Imports real, externally-sourced stays for every college in the database.
 *
 * `npm run import:stays` (reads DATABASE_URL from .env.local).
 *
 * The properties API already backfills listings lazily via `after()` when a
 * student filters by college, but that only fills in hubs somebody has already
 * browsed. This runs the same sync across every college up front, so the
 * catalogue is populated before the first visitor arrives.
 *
 * Everything it writes is marked `is_verified = false` — these are real places
 * with real coordinates, not stays MoveIn has audited.
 */
import { ensureSchema } from "../server/schema";
import { getPool } from "../server/db";
import { CollegeRepository } from "../server/repositories/CollegeRepository";
import { ExternalPropertyService } from "../server/services/ExternalPropertyService";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const run = async () => {
  await ensureSchema();

  // The old mock generator is gone; clear anything it left behind so the
  // catalogue holds only seeded stock and genuinely external listings.
  const { rowCount } = await getPool().query(
    `DELETE FROM properties WHERE external_source = 'mock'`
  );
  if (rowCount) console.log(`Removed ${rowCount} leftover mock listings.`);

  const colleges = await new CollegeRepository().findAll();
  const externalPropertyService = new ExternalPropertyService({ patient: true });

  if (colleges.length === 0) {
    console.log("No colleges found — run `npm run seed` first.");
    return;
  }

  let imported = 0;
  for (const [index, college] of colleges.entries()) {
    try {
      const saved = await externalPropertyService.syncNearbyProperties(college.college_id);
      imported += saved;
      console.log(`  ${college.name}: +${saved}`);
    } catch (error) {
      console.error(`  ${college.name}: failed —`, (error as Error).message);
    }

    // Overpass asks clients not to hammer it; the public mirrors enforce this.
    if (index < colleges.length - 1) await sleep(2000);
  }

  console.log(`\nImported ${imported} real listings across ${colleges.length} colleges.`);
};

run()
  .then(async () => {
    await getPool().end();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Import failed:", error);
    await getPool().end();
    process.exit(1);
  });
