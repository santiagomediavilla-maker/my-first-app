import { NextResponse } from "next/server";
import { readSession, writeSession } from "@/lib/storage";
import { anthropic, MODELS } from "@/lib/claude";
import { buildScoringPrompt } from "@/lib/prompts";
import { ScoringResult } from "@/types";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const session = await readSession(sessionId);

  if (
    !session ||
    !session.brief ||
    !session.surveyResults ||
    !session.focusGroupOutput ||
    !session.interviewsOutput ||
    !session.marketValidation
  ) {
    return NextResponse.json({ error: "Session not ready for scoring" }, { status: 400 });
  }

  const prompt = buildScoringPrompt(
    session.brief,
    session.surveyResults,
    session.focusGroupOutput,
    session.interviewsOutput,
    session.marketValidation
  );

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: MODELS.smart,
        max_tokens: 4000,
        system: prompt.system,
        messages: [{ role: "user", content: prompt.user }],
      });

      const text = (response.content[0] as { type: string; text: string }).text.trim();
      const jsonStr = text.startsWith("{") ? text : text.slice(text.indexOf("{"));
      const data = JSON.parse(jsonStr) as Omit<ScoringResult, "generatedAt">;

      const scoring: ScoringResult = {
        ...data,
        generatedAt: new Date().toISOString(),
      };

      const updated = {
        ...session,
        scoring,
        phase: "synthesis" as const,
        updatedAt: new Date().toISOString(),
      };
      await writeSession(updated);
      return NextResponse.json(updated);
    } catch {
      if (attempt === 2) {
        return NextResponse.json({ error: "Failed to generate scoring" }, { status: 500 });
      }
    }
  }
}
