import { NextResponse } from "next/server";
import { readSession, writeSession } from "@/lib/storage";
import { anthropic, MODELS } from "@/lib/claude";
import { buildFocusGroupSimulationPrompt } from "@/lib/prompts";
import { FocusGroupOutput } from "@/types";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const session = await readSession(sessionId);
  if (!session || !session.brief || !session.personas || !session.focusGroupGuide) {
    return NextResponse.json({ error: "Session not ready for focus group" }, { status: 400 });
  }

  const guide = session.focusGroupGuide;
  const participants = session.personas.filter((p) => guide.participantIds.includes(p.id));

  const prompt = buildFocusGroupSimulationPrompt(guide, participants, session.brief);

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: MODELS.smart,
        max_tokens: 6000,
        system: prompt.system,
        messages: [{ role: "user", content: prompt.user }],
      });

      const text = (response.content[0] as { type: string; text: string }).text.trim();
      const jsonStr = text.startsWith("{") ? text : text.slice(text.indexOf("{"));
      const output = JSON.parse(jsonStr) as Omit<FocusGroupOutput, "generatedAt">;

      const focusGroupOutput: FocusGroupOutput = {
        ...output,
        generatedAt: new Date().toISOString(),
      };

      const updated = {
        ...session,
        focusGroupOutput,
        phase: "interviews" as const,
        updatedAt: new Date().toISOString(),
      };
      await writeSession(updated);
      return NextResponse.json(updated);
    } catch {
      if (attempt === 2) {
        return NextResponse.json({ error: "Failed to run focus group" }, { status: 500 });
      }
    }
  }
}
