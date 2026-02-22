import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "@/auth.config";

const { auth } = NextAuth(authConfig);

const PUBLIC_API_ROUTES = [
  "/api/health",
  "/api/schools",
];

const PUBLIC_API_PREFIXES = [
  "/api/auth/",
];

const ADMIN_ROLES = new Set(["CANTEEN_ADMIN", "SCHOOL_ADMIN", "SUPER_ADMIN"]);

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:8081",
  "http://localhost:19006",
];

function isPublicApiRoute(pathname: string): boolean {
  if (PUBLIC_API_ROUTES.includes(pathname)) {
    return true;
  }

  return PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const isApiRoute = pathname.startsWith("/api/");
  const isAdminRoute = pathname.startsWith("/admin");
  const origin = request.headers.get("origin") ?? "";

  if (request.method === "OPTIONS" && isApiRoute) {
    const preflightResponse = new NextResponse(null, { status: 204 });
    return handleCors(origin, addSecurityHeaders(preflightResponse));
  }

  if (!isApiRoute && !isAdminRoute) {
    return addSecurityHeaders(NextResponse.next());
  }

  if (isApiRoute && isPublicApiRoute(pathname)) {
    return handleCors(origin, addSecurityHeaders(NextResponse.next()));
  }

  if (isAdminRoute) {
    if (pathname === "/admin/login") {
      return addSecurityHeaders(NextResponse.next());
    }

    const role = request.auth?.user?.role;
    const isAdminRole = typeof role === "string" && ADMIN_ROLES.has(role);
    if (!request.auth?.user || !isAdminRole) {
      const loginUrl = new URL("/admin/login", request.url);
      return addSecurityHeaders(NextResponse.redirect(loginUrl));
    }

    return addSecurityHeaders(NextResponse.next());
  }

  if (!request.auth?.user) {
    const unauthorizedResponse = NextResponse.json(
      { error: "UNAUTHORIZED", message: "Authentication required" },
      { status: 401 }
    );
    return handleCors(origin, addSecurityHeaders(unauthorizedResponse));
  }

  return handleCors(origin, addSecurityHeaders(NextResponse.next()));
});

function handleCors(origin: string, response: NextResponse): NextResponse {
  if (!origin) {
    return response;
  }

  const isAllowed =
    process.env.NODE_ENV === "development" ||
    ALLOWED_ORIGINS.includes(origin);

  if (!isAllowed) {
    return response;
  }

  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  response.headers.set("Access-Control-Max-Age", "86400");
  response.headers.set("Vary", "Origin");

  return response;
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
}

export const config = {
  matcher: ["/api/:path*", "/admin/:path*"],
};
