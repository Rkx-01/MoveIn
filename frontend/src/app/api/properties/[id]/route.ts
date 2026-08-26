import { PropertyService } from "@/server/services/PropertyService";
import { fail, handler, ok } from "@/server/http";

const propertyService = new PropertyService();

export const GET = handler(
  async (_request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    const property = await propertyService.getPropertyDetails(id);
    if (!property) return fail("Not found", 404);
    return ok({ data: property });
  }
);
