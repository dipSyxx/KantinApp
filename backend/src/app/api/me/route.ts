import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { user, error } = await requireUser(request);
  if (error) return error;

  return NextResponse.json({ user });
}
