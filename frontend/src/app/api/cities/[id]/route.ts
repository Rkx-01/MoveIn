import { CityRepository } from "@/server/repositories/CityRepository";
import { fail, handler, ok } from "@/server/http";

const cityRepository = new CityRepository();

export const GET = handler(
  async (_request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    const city = await cityRepository.findById(id);
    if (!city) return fail("City not found", 404);
    return ok({ data: city });
  }
);
