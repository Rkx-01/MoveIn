import { AuthService } from "@/server/services/AuthService";
import { handler, ok } from "@/server/http";

const authService = new AuthService();

export const POST = handler(async (request) => {
  const { email, password } = await request.json();
  return ok(await authService.login(email, password));
});
