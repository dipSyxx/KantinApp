import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { validateBody } from "@/lib/validate";
import { unauthorized } from "@/lib/errors";
import { signAccessToken, signRefreshToken, verifyToken } from "@/lib/auth";

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const result = await validateBody(request, refreshSchema);
  if (result.error) return result.error;

  const { refreshToken } = result.data;

  // Verify the JWT itself is valid
  const payload = verifyToken(refreshToken);
  if (!payload) {
    return unauthorized("Invalid or expired refresh token");
  }

  // Find the stored refresh token
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (!storedToken || storedToken.expiresAt < new Date()) {
    // Clean up expired token if it exists
    if (storedToken) {
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
    }
    return unauthorized("Refresh token expired or invalid");
  }

  // Rotate: delete old token, create new one
  await prisma.refreshToken.delete({ where: { id: storedToken.id } });

  const newAccessToken = signAccessToken(storedToken.user.id, storedToken.user.role);
  const newRefreshToken = signRefreshToken(storedToken.user.id);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      userId: storedToken.user.id,
      expiresAt,
    },
  });

  return NextResponse.json({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });
}
