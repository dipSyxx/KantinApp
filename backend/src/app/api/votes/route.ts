import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { validateBody } from "@/lib/validate";
import { badRequest } from "@/lib/errors";
import { castVote } from "@/services/vote.service";
import { rateLimit, VOTE_LIMIT } from "@/lib/ratelimit";
import { logger } from "@/lib/logger";

const voteSchema = z.object({
  menuItemId: z.string().min(1),
  value: z.number().int().min(-1).max(1),
});

export async function POST(request: NextRequest) {
  // Require authenticated user
  const { user, error: authError } = await requireUser(request);
  if (authError) return authError;

  // Rate limit
  const rl = rateLimit(`vote:${user!.id}`, VOTE_LIMIT);
  if (!rl.success) {
    logger.warn("Vote rate limit exceeded", { userId: user!.id });
    return NextResponse.json(
      { error: "RATE_LIMITED", message: "Too many vote actions. Try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  // Validate body
  const result = await validateBody(request, voteSchema);
  if (result.error) return result.error;

  const { menuItemId, value } = result.data;

  // Cast the vote
  const voteResult = await castVote(menuItemId, user!.id, value);

  if (voteResult.error) {
    return badRequest(voteResult.error);
  }

  logger.info("Vote cast", { userId: user!.id, menuItemId, value });

  return NextResponse.json(voteResult.data, { status: 201 });
}
