import { runSeed } from "@/server/seed";
import { fail, handler, ok } from "@/server/http";

export const maxDuration = 60;

/**
 * Populates the database with the Pune MVP dataset.
 *
 * Destructive, so it is gated behind SEED_SECRET. Call it once after a fresh
 * deploy:
 *   curl -X POST https://<app>/api/admin/seed -H "x-seed-secret: <SEED_SECRET>"
 * If SEED_SECRET is unset the route refuses to run rather than defaulting open.
 */
export const POST = handler(async (request) => {
  const secret = process.env.SEED_SECRET;
  if (!secret) {
    return fail("SEED_SECRET is not configured; seeding is disabled.", 503);
  }
  if (request.headers.get("x-seed-secret") !== secret) {
    return fail("Not authorized to access this route", 401);
  }

  // ?demo=false seeds cities/colleges/users but skips the invented demo stays.
  const includeDemoProperties =
    new URL(request.url).searchParams.get("demo") !== "false";
  const summary = await runSeed({ includeDemoProperties });
  return ok({ data: summary });
});
