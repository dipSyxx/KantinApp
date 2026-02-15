import { NextRequest } from "next/server";
import { ZodError, type ZodTypeAny, type z } from "zod";
import { validationError } from "./errors";

/**
 * Parse and validate request JSON body against a Zod schema.
 * Returns the parsed data or a NextResponse with validation errors.
 */
export async function validateBody<S extends ZodTypeAny>(
  request: NextRequest,
  schema: S
): Promise<{ data: z.output<S>; error?: never } | { data?: never; error: ReturnType<typeof validationError> }> {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    return { data };
  } catch (err) {
    if (err instanceof ZodError) {
      return { error: validationError(err) };
    }
    return { error: validationError(new ZodError([])) };
  }
}

/**
 * Parse and validate URL search params against a Zod schema.
 */
export function validateQuery<S extends ZodTypeAny>(
  request: NextRequest,
  schema: S
): { data: z.output<S>; error?: never } | { data?: never; error: ReturnType<typeof validationError> } {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams.entries());
    const data = schema.parse(params);
    return { data };
  } catch (err) {
    if (err instanceof ZodError) {
      return { error: validationError(err) };
    }
    return { error: validationError(new ZodError([])) };
  }
}
