import OpenAI from "openai";
import type { Framework } from "./frameworks";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MODEL = "gpt-4o";

export interface Challenge {
  title: string;
  prompt: string; // markdown-formatted problem statement
  frameworkId: string;
  generatedAt: string; // ISO timestamp
}

/**
 * Generates a single challenge solvable by a competent developer in
 * roughly 10 minutes, scoped to the given framework's idioms.
 */
export async function generateChallenge(framework: Framework): Promise<Challenge> {
  const system = `You write short, practical coding challenges for a daily practice app aimed at
experienced developers who want to keep their unassisted coding skills sharp.

Rules:
- The challenge must be solvable from scratch by a competent developer in
  roughly 10 minutes, without external references.
- It must be idiomatic to ${framework.label} specifically — not a generic
  algorithm problem with the framework name pasted on top.
- No difficulty tiers: aim for a solid "everyday mid-level task" difficulty.
- Output ONLY a JSON object with this exact shape, no prose, no markdown
  fences:
  {"title": string, "prompt": string}
  "prompt" may use markdown for formatting (code fences, lists) within the
  problem statement itself.`;

  const completion = await openai.chat.completions.create({
    model: MODEL,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: `Generate today's ${framework.label} challenge.` },
    ],
  });

  const text = completion.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(text) as { title: string; prompt: string };

  return {
    title: parsed.title,
    prompt: parsed.prompt,
    frameworkId: framework.id,
    generatedAt: new Date().toISOString(),
  };
}

export interface EvaluationRequest {
  framework: Framework;
  challenge: Challenge;
  code: string;
  completedEarly: boolean;
  secondsRemainingAtSubmit: number;
}

export interface Evaluation {
  feedback: string;
  solution: string; // reference solution, hidden behind a reveal in the UI
}

/**
 * Static review only — no code execution. Reviews against the relevant
 * subset of the five code-review-and-quality axes (correctness,
 * readability, architecture, security, performance), skipping axes that
 * don't meaningfully apply to the snippet. Also returns a reference
 * solution so the UI can offer it behind a "see result" toggle.
 */
export async function evaluateSubmission(req: EvaluationRequest): Promise<Evaluation> {
  const { framework, challenge, code, completedEarly, secondsRemainingAtSubmit } = req;

  const timingNote = completedEarly
    ? `The developer submitted with ${secondsRemainingAtSubmit} seconds left on the clock — they consider this a finished attempt.`
    : `The developer ran out of time and the editor was locked; whatever is below is however far they got, not a deliberate final answer.`;

  const system = `You are a thoughtful senior engineer giving a colleague quick, honest
feedback on a timed practice exercise (~10 minutes, no AI assistance
allowed during the attempt, no code execution available to you — read
the code and reason about it, don't claim to have run it).

Review the submission using whichever of these five lenses actually
apply to this snippet — skip any that are genuinely not relevant rather
than forcing a comment on all five:
- Correctness (does the logic do what the prompt asked; edge cases; bugs)
- Readability & simplicity (naming, structure, unnecessary complexity)
- Architecture (does the shape of the solution fit the problem)
- Security (only if the snippet actually touches an attack surface)
- Performance (only if there's a real, findable inefficiency)

${timingNote}
${completedEarly ? "" : "Acknowledge the incompleteness first and briefly, then focus feedback on what was solid in what they got done and what the remaining approach should have been — don't pile on 'missing X' as if it were a bug in finished code."}

Write 2-4 short paragraphs of plain, direct, conversational feedback.
No headers, no bullet rubric, no numeric scores, no markdown tables.
Be honest about real issues — don't soften them — but keep the tone like
a peer coaching, not a formal PR review.

Also write a clean, idiomatic reference solution to the original challenge
in ${framework.label}, independent of what the developer submitted.

Output ONLY a JSON object with this exact shape, no prose, no markdown
fences: {"feedback": string, "solution": string}`;

  const completion = await openai.chat.completions.create({
    model: MODEL,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      {
        role: "user",
        content: `Framework: ${framework.label}

Challenge: ${challenge.title}
${challenge.prompt}

Submitted code:
\`\`\`
${code}
\`\`\``,
      },
    ],
  });

  const text = completion.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(text) as Partial<Evaluation>;
  return { feedback: parsed.feedback ?? "", solution: parsed.solution ?? "" };
}
