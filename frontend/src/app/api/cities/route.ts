import { CityRepository } from "@/server/repositories/CityRepository";
import { handler, ok } from "@/server/http";

const cityRepository = new CityRepository();

export const GET = handler(async () => {
  return ok({ data: await cityRepository.findAll() });
});
