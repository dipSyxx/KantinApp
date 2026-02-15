import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/db";
import { validateBody } from "@/lib/validate";
import { signAccessToken, signRefreshToken } from "@/lib/auth";

const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, "Koden må være 6 siffer"),
});

export async function POST(request: NextRequest) {
  const result = await validateBody(request, verifySchema);
  if (result.error) return result.error;

  const { email, code } = result.data;
  const emailLower = email.toLowerCase();

  // Find the verification token
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { identifier: emailLower },
  });

  if (!verificationToken) {
    return NextResponse.json(
      { error: "Ingen ventende verifisering funnet. Registrer deg på nytt." },
      { status: 404 }
    );
  }

  // Check expiration
  if (verificationToken.expires < new Date()) {
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    });
    return NextResponse.json(
      { error: "Koden har utløpt. Registrer deg på nytt." },
      { status: 410 }
    );
  }

  // Compare OTP code
  const isValid = await compare(code, verificationToken.token);
  if (!isValid) {
    return NextResponse.json(
      { error: "Feil kode. Prøv igjen." },
      { status: 401 }
    );
  }

  // Check if user was created in the meantime (race condition)
  const existingUser = await prisma.user.findUnique({
    where: { email: emailLower },
  });

  if (existingUser) {
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    });
    return NextResponse.json(
      { error: "Denne e-postadressen er allerede registrert." },
      { status: 409 }
    );
  }

  // Create the user
  const user = await prisma.user.create({
    data: {
      name: verificationToken.name,
      email: emailLower,
      password: verificationToken.password,
      role: "STUDENT",
    },
  });

  // Delete the verification token
  await prisma.verificationToken.delete({
    where: { id: verificationToken.id },
  });

  // Generate JWT tokens
  const accessToken = signAccessToken(user.id, user.role);
  const refreshTokenValue = signRefreshToken(user.id);

  // Store refresh token
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: {
      token: refreshTokenValue,
      userId: user.id,
      expiresAt,
    },
  });

  const response = NextResponse.json({
    accessToken,
    refreshToken: refreshTokenValue,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });

  // Set httpOnly cookies (for admin web UI compatibility)
  response.cookies.set("admin_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15,
  });

  response.cookies.set("admin_refresh", refreshTokenValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
