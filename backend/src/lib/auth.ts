import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { prisma } from "./db";
import { unauthorized, forbidden } from "./errors";
import type { Role } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-me";
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

export type TokenPayload = {
  sub: string; // userId
  role: Role;
  iat?: number;
  exp?: number;
};

/**
 * Sign an access token
 */
export function signAccessToken(userId: string, role: Role): string {
  return jwt.sign({ sub: userId, role }, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

/**
 * Sign a refresh token
 */
export function signRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId, type: "refresh" }, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Extract token payload from request Authorization header
 */
export function getTokenPayload(request: NextRequest): TokenPayload | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  return verifyToken(authHeader.slice(7));
}

/**
 * Require an authenticated user. Returns user ID and role, or error response.
 */
export async function requireUser(request: NextRequest) {
  const payload = getTokenPayload(request);
  if (!payload) {
    return { user: null, error: unauthorized() };
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!user) {
    return { user: null, error: unauthorized("User not found") };
  }

  return { user, error: null };
}

/**
 * Require a specific role. Must be called after requireUser.
 */
export function requireRole(userRole: Role, allowedRoles: Role[]) {
  if (!allowedRoles.includes(userRole)) {
    return forbidden(`Role '${userRole}' is not allowed. Required: ${allowedRoles.join(", ")}`);
  }
  return null;
}
