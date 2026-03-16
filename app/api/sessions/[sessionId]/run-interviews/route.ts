import { NextResponse } from "next/server";
import { readSession, writeSession } from "@/lib/storage";
import { anthropic, MODELS } from "@/lib/claude";
import { buildInterviewSimulationPrompt } from "@/lib/prompts";
import { InterviewResult, InterviewsOutput } from "@/types";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const session = await readSession(sessionId);
  if (!session || !session.brief || !session.personas || !session.interviewGuide) {
    return NextResponse.json({ error: "Session not ready for interviews" }, { status: 400 });
  }

  const guide = session.interviewGuide;
  const participants = session.personas.filter((p) => guide.participantIds.includes(p.id));
  const interviews: InterviewResult[] = [];

  for (const persona of participants) {
    const prompt = buildInterviewSimulationPrompt(persona, guide, session.brief);

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
        const result = JSON.parse(jsonStr) as InterviewResult;
        interviews.push(result);
        break;
      } catch {
        if (attempt === 2) {
          interviews.push({
            personaId: persona.id,
            deepPurchaseReasons: [],
            nonPurchaseReasons: [],
            currentAlternatives: [],
            emotionalContext: "Unable to generate.",
            functionalBarriers: [],
            userLanguage: [],
            triggersToPurchase: [],
            summary: "Interview generation failed.",
          });
        }
      }
    }
  }

  // Build global synthesis from all interviews
  const synthPrompt = `Synthesize these interview findings in 2-3 sentences:\n${interviews.map((i) => i.summary).join("\n")}`;
  let globalSynthesis = interviews.map((i) => i.summary).join(" ");

  try {
    const synthResp = await anthropic.messages.create({
      model: MODELS.smart,
      max_tokens: 512,
      messages: [{ role: "user", content: synthPrompt }],
    });
    globalSynthesis = (synthResp.content[0] as { type: string; text: string }).text.trim();
  } catch {
    // use fallback
  }

  const interviewsOutput: InterviewsOutput = {
    interviews,
    globalSynthesis,
    generatedAt: new Date().toISOString(),
  };

  const updated = {
    ...session,
    interviewsOutput,
    phase: "market" as const,
    updatedAt: new Date().toISOString(),
  };

  await writeSession(updated);
  return NextResponse.json(updated);
}
