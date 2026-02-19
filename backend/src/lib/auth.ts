import type { NextRequest } from "next/server";
import type { Role } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { forbidden, unauthorized } from "@/lib/errors";

type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

async function resolveAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true },
  });
}

export async function getOptionalUser(_request?: NextRequest) {
  const user = await resolveAuthenticatedUser();
  return { user, error: null };
}

export async function requireUser(_request?: NextRequest) {
  const user = await resolveAuthenticatedUser();
  if (!user) {
    return { user: null, error: unauthorized() };
  }

  return { user, error: null };
}

export function requireRole(userRole: Role, allowedRoles: Role[]) {
  if (!allowedRoles.includes(userRole)) {
    return forbidden(`Role '${userRole}' is not allowed. Required: ${allowedRoles.join(", ")}`);
  }

  return null;
}
