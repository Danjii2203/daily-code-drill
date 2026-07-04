import { NextRequest, NextResponse } from "next/server";
import { getFramework } from "@/lib/frameworks";
import { getCachedChallenge, setCachedChallenge } from "@/lib/kv";
import { generateChallenge } from "@/lib/openai";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const frameworkId = request.nextUrl.searchParams.get("framework");
  const framework = frameworkId ? getFramework(frameworkId) : undefined;

  if (!framework) {
    return NextResponse.json({ error: "Unknown or missing framework." }, { status: 400 });
  }

  const cached = await getCachedChallenge(framework.id);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const challenge = await generateChallenge(framework);
    await setCachedChallenge(framework.id, challenge);
    return NextResponse.json(challenge);
  } catch (err) {
    console.error("Challenge generation failed", err);
    return NextResponse.json({ error: "Could not generate today's challenge. Try again shortly." }, { status: 502 });
  }
}
