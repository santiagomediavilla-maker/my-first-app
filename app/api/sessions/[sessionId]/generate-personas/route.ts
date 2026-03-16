import { NextResponse } from "next/server";
import { readSession, writeSession } from "@/lib/storage";
import { anthropic, MODELS } from "@/lib/claude";
import { buildPersonasBatchPrompt } from "@/lib/prompts";
import { SyntheticPersona } from "@/types";

const BATCH_SIZE = 10;
const TOTAL_PERSONAS = 30;

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const session = readSession(sessionId);
  if (!session || !session.brief) {
    return NextResponse.json({ error: "Session not found or missing brief" }, { status: 404 });
  }

  const allPersonas: SyntheticPersona[] = [];
  const batches = Math.ceil(TOTAL_PERSONAS / BATCH_SIZE);

  for (let i = 0; i < batches; i++) {
    const prompt = buildPersonasBatchPrompt(session.brief, i, BATCH_SIZE, allPersonas);

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await anthropic.messages.create({
          model: MODELS.smart,
          max_tokens: 6000,
          system: prompt.system,
          messages: [{ role: "user", content: prompt.user }],
        });

        const text = (response.content[0] as { type: string; text: string }).text.trim();
        const jsonStr = text.startsWith("[") ? text : text.slice(text.indexOf("["));
        const batch = JSON.parse(jsonStr) as SyntheticPersona[];
        allPersonas.push(...batch);
        break;
      } catch {
        if (attempt === 2) {
          return NextResponse.json(
            { error: `Failed to generate personas batch ${i + 1}` },
            { status: 500 }
          );
        }
      }
    }
  }

  const updated = {
    ...session,
    personas: allPersonas,
    phase: "survey" as const,
    updatedAt: new Date().toISOString(),
  };

  writeSession(updated);
  return NextResponse.json(updated);
}
