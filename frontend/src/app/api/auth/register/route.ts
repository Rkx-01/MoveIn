import { AuthService } from "@/server/services/AuthService";
import { handler, ok } from "@/server/http";

const authService = new AuthService();

export const POST = handler(async (request) => {
  const data = await authService.registerUser(await request.json());
  return ok(data, { status: 201 });
});
