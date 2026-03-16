import { NextResponse } from "next/server";
import { readSession, writeSession } from "@/lib/storage";
import { anthropic, MODELS } from "@/lib/claude";
import { buildActionPlanPrompt } from "@/lib/prompts";
import { ActionPlan } from "@/types";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const session = await readSession(sessionId);

  if (!session || !session.brief || !session.scoring || !session.synthesis) {
    return NextResponse.json({ error: "Session not ready for action plan" }, { status: 400 });
  }

  const prompt = buildActionPlanPrompt(
    session.brief,
    session.scoring,
    session.synthesis
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
      const { steps } = JSON.parse(jsonStr);

      const actionPlan: ActionPlan = {
        steps,
        generatedAt: new Date().toISOString(),
      };

      const updated = {
        ...session,
        actionPlan,
        phase: "complete" as const,
        updatedAt: new Date().toISOString(),
      };
      await writeSession(updated);
      return NextResponse.json(updated);
    } catch {
      if (attempt === 2) {
        return NextResponse.json({ error: "Failed to generate action plan" }, { status: 500 });
      }
    }
  }
}
