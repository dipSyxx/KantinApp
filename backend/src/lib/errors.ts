import { NextResponse } from "next/server";
import { ZodError } from "zod";

export type ApiError = {
  error: string;
  message: string;
  details?: unknown;
};

export function unauthorized(message = "Authentication required"): NextResponse<ApiError> {
  return NextResponse.json({ error: "UNAUTHORIZED", message }, { status: 401 });
}

export function forbidden(message = "Insufficient permissions"): NextResponse<ApiError> {
  return NextResponse.json({ error: "FORBIDDEN", message }, { status: 403 });
}

export function notFound(message = "Resource not found"): NextResponse<ApiError> {
  return NextResponse.json({ error: "NOT_FOUND", message }, { status: 404 });
}

export function conflict(message = "Resource conflict"): NextResponse<ApiError> {
  return NextResponse.json({ error: "CONFLICT", message }, { status: 409 });
}

export function validationError(error: ZodError): NextResponse<ApiError> {
  return NextResponse.json(
    {
      error: "VALIDATION_ERROR",
      message: "Invalid request data",
      details: error.flatten().fieldErrors,
    },
    { status: 422 }
  );
}

export function badRequest(message = "Bad request"): NextResponse<ApiError> {
  return NextResponse.json({ error: "BAD_REQUEST", message }, { status: 400 });
}

export function serverError(message = "Internal server error"): NextResponse<ApiError> {
  console.error("[SERVER_ERROR]", message);
  return NextResponse.json({ error: "SERVER_ERROR", message }, { status: 500 });
}
