import { NextRequest, NextResponse } from "next/server";

// Public API routes that don't require auth
const PUBLIC_API_ROUTES = [
  "/api/health",
  "/api/auth/login",
  "/api/auth/refresh",
  "/api/menu/week",
  "/api/menu/day",
];

// Routes that start with these prefixes are public
const PUBLIC_PREFIXES = [
  "/api/menu-item/", // menu item detail (myVote is optional)
];

// CORS allowed origins
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:8081", // Expo dev
  "http://localhost:19006", // Expo web
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get("origin") ?? "";

  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return handleCors(origin, new NextResponse(null, { status: 204 }));
  }

  // Allow non-API routes
  if (!pathname.startsWith("/api/") && !pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Allow public API routes
  if (PUBLIC_API_ROUTES.includes(pathname)) {
    return handleCors(origin, addSecurityHeaders(NextResponse.next()));
  }

  // Allow public prefixes
  if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return handleCors(origin, addSecurityHeaders(NextResponse.next()));
  }

  // For protected routes, check Authorization header
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    // For admin pages (browser), we can't use Bearer tokens in middleware easily
    // so we let the page components handle auth for now
    if (pathname.startsWith("/admin")) {
      return addSecurityHeaders(NextResponse.next());
    }

    return handleCors(
      origin,
      NextResponse.json(
        { error: "UNAUTHORIZED", message: "Authentication required" },
        { status: 401 }
      )
    );
  }

  // Token validation is done in the route handlers via requireUser()
  // Middleware just checks presence
  return handleCors(origin, addSecurityHeaders(NextResponse.next()));
}

function handleCors(origin: string, response: NextResponse): NextResponse {
  // In production, check ALLOWED_ORIGINS strictly
  // For dev, allow all origins
  const isAllowed =
    process.env.NODE_ENV === "development" ||
    ALLOWED_ORIGINS.includes(origin) ||
    !origin; // same-origin requests have no Origin header

  if (isAllowed) {
    response.headers.set("Access-Control-Allow-Origin", origin || "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    response.headers.set("Access-Control-Max-Age", "86400");
  }

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
