/**
 * Local seeding entrypoint: `npm run seed` (reads DATABASE_URL from .env.local).
 * In production, POST /api/admin/seed with the x-seed-secret header instead.
 *
 * Pass `--no-demo-properties` to seed cities, colleges and users but skip the
 * invented demo stays, leaving the catalogue to `npm run import:stays`.
 */
import { runSeed } from "../server/seed";

const includeDemoProperties = !process.argv.includes("--no-demo-properties");

runSeed({ includeDemoProperties })
  .then((summary) => {
    console.log("Seed complete:", summary);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
