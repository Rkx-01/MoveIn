import { CollegeRepository } from "@/server/repositories/CollegeRepository";
import { handler, ok, searchParamsToObject } from "@/server/http";

const collegeRepository = new CollegeRepository();

export const GET = handler(async (request) => {
  const { q } = searchParamsToObject(request.url);
  const colleges = q ? await collegeRepository.search(q) : await collegeRepository.findAll();
  return ok({ data: colleges });
});
