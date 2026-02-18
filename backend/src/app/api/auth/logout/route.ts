import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  let bodyRefreshToken: string | null = null;

  // Optional JSON body for mobile clients: { refreshToken: string }
  try {
    if (request.headers.get("content-type")?.includes("application/json")) {
      const body = await request.json();
      if (body && typeof body.refreshToken === "string" && body.refreshToken.length > 0) {
        bodyRefreshToken = body.refreshToken;
      }
    }
  } catch {
    // Ignore invalid/empty JSON body and continue with cookie-based logout.
  }

  const cookieRefreshToken = request.cookies.get("admin_refresh")?.value ?? null;
  const tokensToRevoke = Array.from(new Set([cookieRefreshToken, bodyRefreshToken].filter(Boolean))) as string[];

  if (tokensToRevoke.length > 0) {
    await prisma.refreshToken.deleteMany({
      where: { token: { in: tokensToRevoke } },
    });
  }

  const response = NextResponse.json({ ok: true });

  // Clear auth cookies
  response.cookies.set("admin_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  response.cookies.set("admin_refresh", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
