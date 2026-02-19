import { AuthError } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { signIn } from "@/auth";
import { prisma } from "@/lib/db";
import { unauthorized } from "@/lib/errors";
import { validateBody } from "@/lib/validate";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const result = await validateBody(request, loginSchema);
  if (result.error) return result.error;

  const { email, password } = result.data;
  const emailLower = email.toLowerCase();

  try {
    const signInResult = await signIn("credentials", {
      email: emailLower,
      password,
      redirect: false,
    });

    if (typeof signInResult === "object" && signInResult && "error" in signInResult && signInResult.error) {
      return unauthorized("Invalid email or password");
    }

    if (typeof signInResult === "string" && signInResult.includes("error=")) {
      return unauthorized("Invalid email or password");
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return unauthorized("Invalid email or password");
    }

    throw error;
  }

  const user = await prisma.user.findUnique({
    where: { email: emailLower },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  if (!user) {
    return unauthorized("Invalid email or password");
  }

  return NextResponse.json({
    ok: true,
    user,
  });
}
