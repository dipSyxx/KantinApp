import { NextRequest, NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { requireUser, requireRole } from "@/lib/auth";

/**
 * POST /api/admin/uploads/sign
 * 
 * Server callback for Vercel Blob client-side uploads.
 * Use this if you want direct browser-to-blob uploads (more efficient for large files).
 * 
 * The frontend can use @vercel/blob/client `upload()` which calls this endpoint
 * to get a signed token, then uploads directly to Vercel Blob.
 */
export async function POST(request: NextRequest) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Authenticate: only admins can upload
        const { user, error: authError } = await requireUser(request);
        if (authError || !user) {
          throw new Error("Unauthorized");
        }

        const roleError = requireRole(user.role, ["CANTEEN_ADMIN", "SCHOOL_ADMIN", "SUPER_ADMIN"]);
        if (roleError) {
          throw new Error("Forbidden: insufficient role");
        }

        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
          ],
          maximumSizeInBytes: 5 * 1024 * 1024, // 5 MB
          tokenPayload: JSON.stringify({
            userId: user.id,
            uploadedAt: new Date().toISOString(),
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Called after upload completes. Can be used to update the database.
        console.log("Upload completed:", blob.url, tokenPayload);
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
