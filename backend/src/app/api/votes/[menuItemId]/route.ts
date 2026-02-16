import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { validateBody } from "@/lib/validate";
import { badRequest, notFound } from "@/lib/errors";
import { castVote } from "@/services/vote.service";
import { prisma } from "@/lib/db";

const updateVoteSchema = z.object({
  value: z.number().int().min(-1).max(1),
});

type RouteParams = { params: Promise<{ menuItemId: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { menuItemId } = await params;

  // Require authenticated user
  const { user, error: authError } = await requireUser(request);
  if (authError) return authError;

  // Check that a vote already exists
  const existingVote = await prisma.vote.findUnique({
    where: {
      menuItemId_userId: {
        menuItemId,
        userId: user!.id,
      },
    },
  });

  if (!existingVote) {
    return notFound("Ingen eksisterende stemme å oppdatere. Bruk POST /api/votes for å opprette en.");
  }

  // Validate body
  const result = await validateBody(request, updateVoteSchema);
  if (result.error) return result.error;

  const { value } = result.data;

  // Update the vote
  const voteResult = await castVote(menuItemId, user!.id, value);

  if (voteResult.error) {
    return badRequest(voteResult.error);
  }

  return NextResponse.json(voteResult.data);
}
