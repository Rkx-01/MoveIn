import { after } from "next/server";
import { PropertyService } from "@/server/services/PropertyService";
import { UserRole, type PropertyFilters } from "@/server/models";
import { handler, ok, requireRole, searchParamsToObject } from "@/server/http";

const propertyService = new PropertyService();

// The post-response Overpass backfill runs inside this route's budget, and
// `after()` gets killed when the budget runs out. The backfill makes up to two
// Overpass calls, each allowed 30s, so it needs more headroom than the
// platform default. (It runs in impatient mode — one pass, no retries.)
export const maxDuration = 60;

export const GET = handler(async (request) => {
  const filters = searchParamsToObject(request.url) as PropertyFilters;
  const { items, total } = await propertyService.getAllAvailableProperties(filters);

  // Backfill live listings after the response is flushed. `after()` keeps the
  // work alive past the return, which a floating promise would not.
  if (filters.college_id) {
    const collegeId = filters.college_id;
    after(async () => {
      try {
        await propertyService.syncExternalForCollege(collegeId);
      } catch (error) {
        console.error("External Sync Failed:", error);
      }
    });
  }

  return ok({
    data: items,
    meta: {
      total,
      page: parseInt(filters.page ?? "1", 10) || 1,
      limit: parseInt(filters.limit ?? "12", 10) || 12,
    },
  });
});

export const POST = handler(async (request) => {
  const user = requireRole(request, UserRole.HOST);
  const body = await request.json();
  const property = await propertyService.createProperty(user.user_id, body);
  return ok({ data: property }, { status: 201 });
});
