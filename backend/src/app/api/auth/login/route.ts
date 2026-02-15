import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { compare } from "bcryptjs";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { validateBody } from "@/lib/validate";
import { unauthorized } from "@/lib/errors";
import { signAccessToken, signRefreshToken } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const result = await validateBody(request, loginSchema);
  if (result.error) return result.error;

  const { email, password } = result.data;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return unauthorized("Invalid email or password");
  }

  // Verify password
  const isValid = await compare(password, user.password);
  if (!isValid) {
    return unauthorized("Invalid email or password");
  }

  // Generate tokens
  const accessToken = signAccessToken(user.id, user.role);
  const refreshTokenValue = signRefreshToken(user.id);

  // Store refresh token in DB
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: {
      token: refreshTokenValue,
      userId: user.id,
      expiresAt,
    },
  });

  return NextResponse.json({
    accessToken,
    refreshToken: refreshTokenValue,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}
