import { NextRequest, NextResponse } from "next/server";
import { getFramework } from "@/lib/frameworks";
import { evaluateSubmission, type Challenge } from "@/lib/openai";

export const runtime = "nodejs";

interface EvaluateBody {
  frameworkId: string;
  challenge: Challenge;
  code: string;
  completedEarly: boolean;
  secondsRemainingAtSubmit: number;
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Partial<EvaluateBody>;
  const framework = body.frameworkId ? getFramework(body.frameworkId) : undefined;

  if (!framework || !body.challenge || typeof body.code !== "string") {
    return NextResponse.json({ error: "Missing framework, challenge, or code." }, { status: 400 });
  }

  // Cap submission size defensively — this is a 10-minute snippet, not a repo.
  if (body.code.length > 20_000) {
    return NextResponse.json({ error: "Submission is too large for a timed drill." }, { status: 413 });
  }

  try {
    const feedback = await evaluateSubmission({
      framework,
      challenge: body.challenge,
      code: body.code,
      completedEarly: Boolean(body.completedEarly),
      secondsRemainingAtSubmit: body.secondsRemainingAtSubmit ?? 0,
    });
    return NextResponse.json({ feedback });
  } catch (err) {
    console.error("Evaluation failed", err);
    return NextResponse.json({ error: "Could not review the submission. Try again." }, { status: 502 });
  }
}
