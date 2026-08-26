import { CollegeRepository } from "@/server/repositories/CollegeRepository";
import { fail, handler, ok } from "@/server/http";

const collegeRepository = new CollegeRepository();

export const GET = handler(
  async (_request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    const college = await collegeRepository.findById(id);
    if (!college) return fail("College not found", 404);
    return ok({ data: college });
  }
);
