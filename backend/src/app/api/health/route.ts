import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  let dbOk = false;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch {
    dbOk = false;
  }

  return NextResponse.json({
    ok: dbOk,
    time: new Date().toISOString(),
    version: process.env.APP_VERSION ?? "0.1.0",
    database: dbOk ? "connected" : "disconnected",
  });
}
