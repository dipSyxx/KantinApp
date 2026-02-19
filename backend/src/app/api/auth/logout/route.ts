import { NextResponse } from "next/server";
import { signOut } from "@/auth";

export async function POST() {
  await signOut({ redirect: false });

  const response = NextResponse.json({ ok: true });

  // Cleanup leftover cookies from the previous auth implementation.
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
