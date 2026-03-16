import { NextResponse } from "next/server";
import { readSession, writeSession } from "@/lib/storage";
import { anthropic, MODELS } from "@/lib/claude";
import { buildFocusGroupGuidePrompt } from "@/lib/prompts";
import { FocusGroupGuide } from "@/types";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const session = await readSession(sessionId);
  if (!session || !session.brief || !session.personas) {
    return NextResponse.json({ error: "Session not ready" }, { status: 400 });
  }

  // Select 7 diverse personas for focus group
  const personas = session.personas;
  const step = Math.floor(personas.length / 7);
  const selected = Array.from({ length: 7 }, (_, i) => personas[i * step]);

  const prompt = buildFocusGroupGuidePrompt(session.brief, selected);

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: MODELS.smart,
        max_tokens: 3000,
        system: prompt.system,
        messages: [{ role: "user", content: prompt.user }],
      });

      const text = (response.content[0] as { type: string; text: string }).text.trim();
      const jsonStr = text.startsWith("{") ? text : text.slice(text.indexOf("{"));
      const { topics } = JSON.parse(jsonStr);

      const guide: FocusGroupGuide = {
        participantIds: selected.map((p) => p.id),
        topics,
      };

      const updated = {
        ...session,
        focusGroupGuide: guide,
        updatedAt: new Date().toISOString(),
      };
      await writeSession(updated);
      return NextResponse.json(updated);
    } catch {
      if (attempt === 2) {
        return NextResponse.json({ error: "Failed to generate focus group guide" }, { status: 500 });
      }
    }
  }
}
