import { NextResponse } from "next/server";
import { readSession, writeSession } from "@/lib/storage";
import { anthropic, MODELS } from "@/lib/claude";
import { buildMarketValidationPrompt } from "@/lib/prompts";
import { MarketValidation } from "@/types";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const session = readSession(sessionId);
  if (!session || !session.brief) {
    return NextResponse.json({ error: "Session not found or missing brief" }, { status: 404 });
  }

  const prompt = buildMarketValidationPrompt(session.brief);

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
      const data = JSON.parse(jsonStr) as Omit<MarketValidation, "generatedAt">;

      const marketValidation: MarketValidation = {
        ...data,
        generatedAt: new Date().toISOString(),
      };

      const updated = {
        ...session,
        marketValidation,
        phase: "scoring" as const,
        updatedAt: new Date().toISOString(),
      };
      writeSession(updated);
      return NextResponse.json(updated);
    } catch {
      if (attempt === 2) {
        return NextResponse.json({ error: "Failed to generate market validation" }, { status: 500 });
      }
    }
  }
}
