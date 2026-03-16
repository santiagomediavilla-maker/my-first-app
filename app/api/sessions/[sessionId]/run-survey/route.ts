import { NextResponse } from "next/server";
import { readSession, writeSession } from "@/lib/storage";
import { anthropic, MODELS } from "@/lib/claude";
import { buildSurveySimulationPrompt, buildSurveyAnalysisPrompt } from "@/lib/prompts";
import { SurveyQuestion, SurveyAnswer } from "@/types";
import { generateId } from "@/lib/utils";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const session = await readSession(sessionId);
  if (!session || !session.brief || !session.personas) {
    return NextResponse.json({ error: "Session not ready for survey" }, { status: 400 });
  }

  const body = await request.json();
  const questions: string[] = body.questions || session.surveyQuestions || [];

  if (!questions.length) {
    return NextResponse.json({ error: "No questions provided" }, { status: 400 });
  }

  const personas = session.personas;
  const surveyQuestions: SurveyQuestion[] = [];

  for (const questionText of questions) {
    const prompt = buildSurveySimulationPrompt(questionText, personas, session.brief);
    let answers: SurveyAnswer[] = [];

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await anthropic.messages.create({
          model: MODELS.fast,
          max_tokens: 8000,
          system: prompt.system,
          messages: [{ role: "user", content: prompt.user }],
        });

        const text = (response.content[0] as { type: string; text: string }).text.trim();
        const jsonStr = text.startsWith("[") ? text : text.slice(text.indexOf("["));
        answers = JSON.parse(jsonStr) as SurveyAnswer[];
        break;
      } catch {
        if (attempt === 2) {
          answers = personas.map((p) => ({
            personaId: p.id,
            answer: "Unable to generate response.",
            sentiment: "neutral" as const,
          }));
        }
      }
    }

    surveyQuestions.push({
      id: generateId(),
      text: questionText,
      createdAt: new Date().toISOString(),
      answers,
    });
  }

  // Generate analysis
  const analysisPrompt = buildSurveyAnalysisPrompt(surveyQuestions, personas, session.brief);
  let analysis = undefined;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: MODELS.smart,
        max_tokens: 2048,
        system: analysisPrompt.system,
        messages: [{ role: "user", content: analysisPrompt.user }],
      });

      const text = (response.content[0] as { type: string; text: string }).text.trim();
      const jsonStr = text.startsWith("{") ? text : text.slice(text.indexOf("{"));
      analysis = JSON.parse(jsonStr);
      break;
    } catch {
      // continue without analysis
    }
  }

  const updated = {
    ...session,
    surveyResults: { questions: surveyQuestions, analysis },
    phase: "focus_group" as const,
    updatedAt: new Date().toISOString(),
  };

  await writeSession(updated);
  return NextResponse.json(updated);
}
