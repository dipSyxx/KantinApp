import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev-secret-change-me"
);

// Public API routes that don't require auth
const PUBLIC_API_ROUTES = [
  "/api/health",
  "/api/auth/login",
  "/api/auth/refresh",
  "/api/auth/logout",
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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get("origin") ?? "";

  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return handleCors(origin, new NextResponse(null, { status: 204 }));
  }

  // Allow non-API, non-admin routes
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

  // ─── Admin pages (browser): cookie-based auth ─────────
  if (pathname.startsWith("/admin")) {
    // Allow access to the login page itself
    if (pathname === "/admin/login") {
      return addSecurityHeaders(NextResponse.next());
    }

    const token = request.cookies.get("admin_token")?.value;

    if (!token) {
      // No cookie → redirect to login
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Verify the JWT token
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const role = payload.role as string;

      // Only allow admin roles
      if (role !== "CANTEEN_ADMIN" && role !== "SCHOOL_ADMIN") {
        const loginUrl = new URL("/admin/login", request.url);
        return NextResponse.redirect(loginUrl);
      }
    } catch {
      // Token expired or invalid → try to refresh
      const refreshToken = request.cookies.get("admin_refresh")?.value;

      if (refreshToken) {
        // Attempt silent refresh
        try {
          const refreshRes = await fetch(new URL("/api/auth/refresh", request.url), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshRes.ok) {
            const data = await refreshRes.json();
            const response = NextResponse.redirect(request.url);

            response.cookies.set("admin_token", data.accessToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              path: "/",
              maxAge: 60 * 15,
            });

            return response;
          }
        } catch {
          // Refresh failed
        }
      }

      // Can't refresh → redirect to login
      const loginUrl = new URL("/admin/login", request.url);
      const response = NextResponse.redirect(loginUrl);
      // Clear invalid cookies
      response.cookies.set("admin_token", "", { path: "/", maxAge: 0 });
      response.cookies.set("admin_refresh", "", { path: "/", maxAge: 0 });
      return response;
    }

    return addSecurityHeaders(NextResponse.next());
  }

  // ─── API routes: Bearer token or cookie auth ───────────
  const authHeader = request.headers.get("authorization");
  const cookieToken = request.cookies.get("admin_token")?.value;

  if (!authHeader?.startsWith("Bearer ") && !cookieToken) {
    return handleCors(
      origin,
      NextResponse.json(
        { error: "UNAUTHORIZED", message: "Authentication required" },
        { status: 401 }
      )
    );
  }

  // If no Bearer header but cookie exists (admin web UI calling API),
  // inject the cookie token as Authorization header for downstream route handlers
  if (!authHeader?.startsWith("Bearer ") && cookieToken) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("authorization", `Bearer ${cookieToken}`);

    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });
    return handleCors(origin, addSecurityHeaders(response));
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
