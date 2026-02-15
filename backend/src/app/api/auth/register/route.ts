import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hash } from "bcryptjs";
import { addMinutes, getYear } from "date-fns";
import { prisma } from "@/lib/db";
import { validateBody } from "@/lib/validate";

const MAILEROO_API_URL = "https://smtp.maileroo.com/api/v2/emails/template";

const ALLOWED_DOMAIN = "@innlandetfylke.no";

const registerSchema = z.object({
  name: z.string().min(2, "Navn må være minst 2 tegn").max(100),
  email: z
    .string()
    .email("Ugyldig e-postadresse")
    .refine(
      (e) => e.toLowerCase().endsWith(ALLOWED_DOMAIN),
      `E-post må slutte med ${ALLOWED_DOMAIN}`
    ),
  password: z.string().min(8, "Passord må være minst 8 tegn"),
});

function generateCode(): string {
  const n = Math.floor(Math.random() * 1_000_000);
  return n.toString().padStart(6, "0");
}

export async function POST(request: NextRequest) {
  const result = await validateBody(request, registerSchema);
  if (result.error) return result.error;

  const { name, email, password } = result.data;
  const emailLower = email.toLowerCase();

  // Check env vars
  const apiKey = process.env.MAILEROO_API_KEY;
  const fromAddress = process.env.MAILEROO_FROM_ADDRESS;
  const fromName = process.env.MAILEROO_FROM_NAME ?? "KantinApp";
  const templateId = Number(process.env.MAILEROO_TEMPLATE_VERIFY_ID);
  const ttlMinutes = Number(process.env.VERIFY_CODE_TTL_MINUTES ?? "10");

  if (!apiKey || !fromAddress || !templateId) {
    return NextResponse.json(
      { error: "E-postsending er ikke konfigurert (sjekk MAILEROO_* env)." },
      { status: 500 }
    );
  }

  // Check if email already registered
  const existingUser = await prisma.user.findUnique({
    where: { email: emailLower },
  });

  if (existingUser) {
    return NextResponse.json(
      { error: "Denne e-postadressen er allerede registrert." },
      { status: 409 }
    );
  }

  // Generate OTP and hash it
  const code = generateCode();
  const tokenHash = await hash(code, 12);

  // Hash the password for temp storage
  const passwordHash = await hash(password, 10);

  const expires = addMinutes(new Date(), ttlMinutes);

  // Delete any existing pending verification for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier: emailLower },
  });

  // Store verification token with temp user data
  await prisma.verificationToken.create({
    data: {
      identifier: emailLower,
      token: tokenHash,
      name,
      password: passwordHash,
      expires,
    },
  });

  // Send templated email via Maileroo
  const payload = {
    from: {
      address: fromAddress,
      display_name: fromName,
    },
    to: [
      {
        address: emailLower,
        display_name: name,
      },
    ],
    subject: `${code} er din KantinApp-verifiseringskode`,
    template_id: templateId,
    template_data: {
      code,
      expiryMinutes: ttlMinutes,
      name: name.split(" ")[0],
      year: getYear(new Date()),
    },
    tracking: true,
    tags: { type: "email-verification" },
  };

  try {
    const res = await fetch(MAILEROO_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json().catch(() => ({}) as Record<string, unknown>);

    if (!res.ok || (json as { success?: boolean })?.success === false) {
      console.error("Maileroo error:", res.status, json);

      await prisma.verificationToken.deleteMany({
        where: { identifier: emailLower },
      });

      const msg =
        (json as { message?: string })?.message ??
        "Kunne ikke sende verifiserings-e-post. Prøv igjen.";
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      expiresAt: expires.toISOString(),
      referenceId: (json as { data?: { reference_id?: string } })?.data?.reference_id ?? null,
    });
  } catch (err) {
    console.error("Maileroo fetch error:", err);
    await prisma.verificationToken.deleteMany({
      where: { identifier: emailLower },
    });
    return NextResponse.json(
      { error: "Nettverksfeil ved sending av e-post." },
      { status: 500 }
    );
  }
}
