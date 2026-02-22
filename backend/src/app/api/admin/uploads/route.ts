import { NextRequest, NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { requireUser, requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * POST /api/admin/uploads
 * Upload a dish image to Vercel Blob.
 *
 * Expects multipart/form-data with:
 *   - file: the image file
 *   - dishId (optional): if provided, updates the dish's imageUrl
 */
export async function POST(request: NextRequest) {
  const { user, error: authError } = await requireUser(request);
  if (authError) return authError;

  const roleError = requireRole(user!.role, ["CANTEEN_ADMIN", "SCHOOL_ADMIN", "SUPER_ADMIN"]);
  if (roleError) return roleError;

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const dishId = formData.get("dishId") as string | null;

  if (!file) {
    return NextResponse.json(
      { error: "No file provided. Include a 'file' field in multipart form data." },
      { status: 400 }
    );
  }

  // Validate type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: `Invalid file type: ${file.type}. Allowed: ${ALLOWED_TYPES.join(", ")}` },
      { status: 400 }
    );
  }

  // Validate size
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max: 5 MB.` },
      { status: 400 }
    );
  }

  // Generate a clean filename
  const ext = file.name.split(".").pop() || "jpg";
  const timestamp = Date.now();
  const safeName = `dishes/${timestamp}.${ext}`;

  // Upload to Vercel Blob
  const blob = await put(safeName, file, {
    access: "public",
    contentType: file.type,
  });

  // If dishId provided, update the dish's imageUrl and delete old blob
  if (dishId) {
    const existingDish = await prisma.dish.findUnique({
      where: { id: dishId },
      select: { imageUrl: true },
    });

    if (existingDish?.imageUrl?.includes(".vercel-storage.com")) {
      const othersUsingSameImage = await prisma.dish.count({
        where: { imageUrl: existingDish.imageUrl, id: { not: dishId } },
      });
      if (othersUsingSameImage === 0) {
        try {
          await del(existingDish.imageUrl);
        } catch {
          // Old blob may not exist, ignore
        }
      }
    }

    await prisma.dish.update({
      where: { id: dishId },
      data: { imageUrl: blob.url },
    });
  }

  return NextResponse.json({
    url: blob.url,
    pathname: blob.pathname,
    contentType: blob.contentType,
    size: file.size,
  }, { status: 201 });
}

/**
 * DELETE /api/admin/uploads
 * Delete an image from Vercel Blob.
 *
 * Expects JSON body: { url: string, dishId?: string }
 */
export async function DELETE(request: NextRequest) {
  const { user, error: authError } = await requireUser(request);
  if (authError) return authError;

  const roleError = requireRole(user!.role, ["CANTEEN_ADMIN", "SCHOOL_ADMIN", "SUPER_ADMIN"]);
  if (roleError) return roleError;

  const body = await request.json();
  const { url, dishId } = body as { url?: string; dishId?: string };

  if (!url || typeof url !== "string") {
    return NextResponse.json(
      { error: "Missing 'url' field." },
      { status: 400 }
    );
  }

  if (url.includes(".vercel-storage.com")) {
    const othersUsingSameImage = await prisma.dish.count({
      where: {
        imageUrl: url,
        ...(dishId ? { id: { not: dishId } } : {}),
      },
    });
    if (othersUsingSameImage === 0) {
      try {
        await del(url);
      } catch {
        // Blob may already be deleted
      }
    }
  }

  if (dishId) {
    await prisma.dish.update({
      where: { id: dishId },
      data: { imageUrl: null },
    });
  }

  return NextResponse.json({ ok: true });
}
