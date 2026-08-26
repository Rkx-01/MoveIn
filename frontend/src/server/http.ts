import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { ensureSchema } from "./schema";
import type { UserRole } from "./models";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_dev_only";

export interface AuthUser {
  user_id: string;
  role: UserRole;
  email?: string;
}

export class HttpError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export const ok = <T>(data: T, init?: ResponseInit) =>
  NextResponse.json({ success: true, ...data }, init);

export const fail = (message: string, status = 500) =>
  NextResponse.json({ success: false, error: message, message }, { status });

/**
 * Replaces the Express `protect` middleware. Returns the decoded user, or null
 * when the Authorization header is missing or the token doesn't verify.
 */
export const getAuthUser = (request: Request): AuthUser | null => {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;

  try {
    const decoded = jwt.verify(header.slice(7), JWT_SECRET) as AuthUser;
    return { user_id: decoded.user_id, role: decoded.role, email: decoded.email };
  } catch {
    return null;
  }
};

/**
 * Wraps a route handler with the two things every Express route got for free:
 * a live database (schema bootstrap) and centralised error handling.
 */
export const handler = <T extends unknown[]>(
  fn: (request: Request, ...args: T) => Promise<Response>
) => {
  return async (request: Request, ...args: T): Promise<Response> => {
    try {
      await ensureSchema();
      return await fn(request, ...args);
    } catch (error) {
      if (error instanceof HttpError) {
        return fail(error.message, error.status);
      }
      const message = error instanceof Error ? error.message : "Server Error";
      console.error("[api]", message, error);
      return fail(message, 500);
    }
  };
};

/** Express `protect` + `authorize` combined. Throws a Response on rejection. */
export const requireRole = (request: Request, ...roles: UserRole[]): AuthUser => {
  const user = getAuthUser(request);
  if (!user) {
    throw new HttpError("Not authorized to access this route", 401);
  }
  if (roles.length && !roles.includes(user.role)) {
    throw new HttpError(`User role ${user.role} is not authorized to access this route`, 403);
  }
  return user;
};

export const searchParamsToObject = (url: string): Record<string, string> =>
  Object.fromEntries(new URL(url).searchParams.entries());
