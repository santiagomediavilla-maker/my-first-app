import { NextResponse } from "next/server";
import { readSession, writeSession } from "@/lib/storage";
import { anthropic, MODELS } from "@/lib/claude";
import { buildInterviewGuidePrompt } from "@/lib/prompts";
import { InterviewGuide } from "@/types";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const session = readSession(sessionId);
  if (!session || !session.brief || !session.personas) {
    return NextResponse.json({ error: "Session not ready" }, { status: 400 });
  }

  // Select 5 personas with diverse perspectives
  const personas = session.personas;
  const indices = [0, 6, 12, 18, 24];
  const selected = indices.map((i) => personas[i]).filter(Boolean);

  const prompt = buildInterviewGuidePrompt(session.brief, selected);

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: MODELS.smart,
        max_tokens: 2048,
        system: prompt.system,
        messages: [{ role: "user", content: prompt.user }],
      });

      const text = (response.content[0] as { type: string; text: string }).text.trim();
      const jsonStr = text.startsWith("{") ? text : text.slice(text.indexOf("{"));
      const { questions } = JSON.parse(jsonStr);

      const guide: InterviewGuide = {
        participantIds: selected.map((p) => p.id),
        questions,
      };

      const updated = {
        ...session,
        interviewGuide: guide,
        updatedAt: new Date().toISOString(),
      };
      writeSession(updated);
      return NextResponse.json(updated);
    } catch {
      if (attempt === 2) {
        return NextResponse.json({ error: "Failed to generate interview guide" }, { status: 500 });
      }
    }
  }
}
