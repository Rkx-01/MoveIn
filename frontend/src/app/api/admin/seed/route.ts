import { ensureMasterData, runSeed } from "@/server/seed";
import { fail, handler, ok } from "@/server/http";

export const maxDuration = 60;

/**
 * Populates the database with the Pune MVP dataset. Gated behind SEED_SECRET;
 * if it is unset the route refuses to run rather than defaulting open.
 *
 * Two modes, and the safe one is the default on purpose — this endpoint is a
 * single curl away from truncating a live database:
 *
 *   ?mode=safe  (default) Adds the schema plus any missing cities and colleges.
 *               Leaves users, bookings, payments and properties alone. Safe to
 *               run against production, and safe to re-run.
 *
 *   ?mode=reset           The original destructive rebuild: TRUNCATEs
 *               payments, bookings, reviews, properties, colleges, cities and
 *               users, then reseeds from scratch. Fresh databases only.
 *               Add &demo=false to skip the invented demo stays.
 *
 *   curl -X POST https://<app>/api/admin/seed -H "x-seed-secret: <SEED_SECRET>"
 */
export const POST = handler(async (request) => {
  const secret = process.env.SEED_SECRET;
  if (!secret) {
    return fail("SEED_SECRET is not configured; seeding is disabled.", 503);
  }
  if (request.headers.get("x-seed-secret") !== secret) {
    return fail("Not authorized to access this route", 401);
  }

  const params = new URL(request.url).searchParams;
  const mode = params.get("mode") ?? "safe";

  if (mode === "safe") {
    const summary = await ensureMasterData();
    return ok({ data: { mode, ...summary } });
  }

  if (mode === "reset") {
    const summary = await runSeed({ includeDemoProperties: params.get("demo") !== "false" });
    return ok({ data: { mode, ...summary } });
  }

  return fail(`Unknown mode "${mode}". Use "safe" or "reset".`, 400);
});
