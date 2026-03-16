import { NextResponse } from "next/server";
import { readSession, writeSession } from "@/lib/storage";
import { anthropic, MODELS } from "@/lib/claude";
import { buildEnrichBriefPrompt } from "@/lib/prompts";
import { BusinessIdeaBrief } from "@/types";

export const maxDuration = 120;

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const session = await readSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const prompt = buildEnrichBriefPrompt(session.brief || {});

  let enriched: BusinessIdeaBrief;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: MODELS.smart,
        max_tokens: 4096,
        system: prompt.system,
        messages: [{ role: "user", content: prompt.user }],
      });

      const text = (response.content[0] as { type: string; text: string }).text.trim();
      const jsonStr = text.startsWith("{") ? text : text.slice(text.indexOf("{"));
      enriched = JSON.parse(jsonStr) as BusinessIdeaBrief;
      enriched.enrichedAt = new Date().toISOString();
      break;
    } catch (err) {
      console.error(`enrich-brief attempt ${attempt + 1} failed:`, err);
      if (attempt === 2) {
        return NextResponse.json({ error: "Failed to enrich brief", detail: String(err) }, { status: 500 });
      }
    }
  }

  const updated = {
    ...session,
    brief: enriched!,
    phase: "brief" as const,
    updatedAt: new Date().toISOString(),
  };

  await writeSession(updated);
  return NextResponse.json(updated);
}
