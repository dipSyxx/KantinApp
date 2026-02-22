import { NextRequest, NextResponse } from "next/server";
import type { AuthenticatedUser } from "@/lib/auth";

/**
 * Resolves the schoolId for the current request.
 *
 * - CANTEEN_ADMIN / SCHOOL_ADMIN / STUDENT: returns their own schoolId
 * - SUPER_ADMIN: reads schoolId from `X-School-Id` header or `schoolId` query param
 *
 * Returns `{ schoolId, error }`. If error is set, return it as the response.
 */
export function getSchoolScope(
  user: AuthenticatedUser,
  request?: NextRequest
): { schoolId: string; error: null } | { schoolId: null; error: NextResponse } {
  if (user.role === "SUPER_ADMIN") {
    const fromHeader = request?.headers.get("x-school-id");
    const fromQuery = request?.nextUrl.searchParams.get("schoolId");
    const schoolId = fromHeader ?? fromQuery;

    if (!schoolId) {
      return {
        schoolId: null,
        error: NextResponse.json(
          { error: "SUPER_ADMIN must provide schoolId via X-School-Id header or schoolId query param" },
          { status: 400 }
        ),
      };
    }

    return { schoolId, error: null };
  }

  if (!user.schoolId) {
    return {
      schoolId: null,
      error: NextResponse.json(
        { error: "User is not associated with a school" },
        { status: 403 }
      ),
    };
  }

  return { schoolId: user.schoolId, error: null };
}
