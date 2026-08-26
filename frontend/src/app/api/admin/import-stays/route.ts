import { CollegeRepository } from "@/server/repositories/CollegeRepository";
import { ExternalPropertyService } from "@/server/services/ExternalPropertyService";
import { ensureSchema } from "@/server/schema";
import { fail, handler, ok } from "@/server/http";

export const maxDuration = 60;

/** Stop starting new colleges once this much of the budget is gone. */
const TIME_BUDGET_MS = 40_000;

/**
 * Imports real stays from OpenStreetMap for colleges that don't have a fresh
 * feed yet. Non-destructive: it only ever inserts listings that are absent.
 *
 * A full 11-college import takes minutes, which no serverless invocation will
 * survive, so this works through as many colleges as fit in one request and
 * reports what is left. Call it repeatedly until `remaining` is 0:
 *
 *   curl -X POST https://<app>/api/admin/import-stays -H "x-seed-secret: <SEED_SECRET>"
 *
 * Locally, prefer `npm run import:stays` — it has no time limit and retries
 * Overpass harder.
 */
export const POST = handler(async (request) => {
  const secret = process.env.SEED_SECRET;
  if (!secret) {
    return fail("SEED_SECRET is not configured; importing is disabled.", 503);
  }
  if (request.headers.get("x-seed-secret") !== secret) {
    return fail("Not authorized to access this route", 401);
  }

  await ensureSchema();

  const colleges = await new CollegeRepository().findAll();
  if (colleges.length === 0) {
    return fail("No colleges found. Run POST /api/admin/seed first.", 409);
  }

  const externalPropertyService = new ExternalPropertyService();
  const startedAt = Date.now();
  const processed: { college: string; imported: number }[] = [];
  let remaining = 0;

  for (const college of colleges) {
    if (Date.now() - startedAt > TIME_BUDGET_MS) {
      remaining++;
      continue;
    }
    try {
      const imported = await externalPropertyService.syncNearbyProperties(college.college_id);
      processed.push({ college: college.name, imported });
    } catch (error) {
      // One college failing to Overpass shouldn't sink the whole request; the
      // next call picks it up, since nothing fresh was cached for it.
      processed.push({ college: college.name, imported: 0 });
      console.error(`Import failed for ${college.name}:`, error);
    }
  }

  const imported = processed.reduce((sum, entry) => sum + entry.imported, 0);
  return ok({ data: { imported, remaining, processed } });
});
