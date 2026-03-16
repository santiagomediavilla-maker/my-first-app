"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Session, SessionPhase, SyntheticPersona, Verdict } from "@/types";

// ─── helpers ─────────────────────────────────────────────────────────────────

function Spinner({ sm }: { sm?: boolean }) {
  return (
    <span
      className={`inline-block border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin ${sm ? "w-4 h-4" : "w-6 h-6"}`}
    />
  );
}

function Section({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 text-base">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function Tag({ children, color }: { children: React.ReactNode; color?: "gray" | "green" | "red" | "amber" | "indigo" }) {
  const resolvedColor = color || "gray";
  const colors: Record<string, string> = {
    gray: "bg-gray-100 text-gray-600",
    green: "bg-emerald-100 text-emerald-700",
    red: "bg-red-100 text-red-700",
    amber: "bg-amber-100 text-amber-700",
    indigo: "bg-indigo-100 text-indigo-700",
  };
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${colors[resolvedColor]}`}>
      {children}
    </span>
  );
}

function Btn({
  onClick,
  loading,
  children,
  variant = "primary",
  disabled,
}: {
  onClick: () => void;
  loading?: boolean;
  children: React.ReactNode;
  variant?: "primary" | "outline";
  disabled?: boolean;
}) {
  const base = "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const styles = variant === "primary"
    ? "bg-gray-900 text-white hover:bg-gray-700"
    : "bg-white text-gray-700 border border-gray-200 hover:border-gray-400";
  return (
    <button className={`${base} ${styles}`} onClick={onClick} disabled={disabled || loading}>
      {loading && <Spinner sm />}
      {children}
    </button>
  );
}

function AiTag() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
      AI
    </span>
  );
}

function BulletList({ items, color }: { items: string[]; color?: "green" | "red" | "amber" | "indigo" }) {
  const dotColors: Record<string, string> = { green: "bg-emerald-400", red: "bg-red-400", amber: "bg-amber-400", indigo: "bg-indigo-400" };
  const dotColor = (color ? dotColors[color] : undefined) || "bg-gray-300";
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
          <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor}`} />
          {item}
        </li>
      ))}
    </ul>
  );
}

// ─── nav config ──────────────────────────────────────────────────────────────

type NavSection =
  | "brief"
  | "personas"
  | "survey"
  | "focus_group"
  | "interviews"
  | "market"
  | "scoring"
  | "synthesis"
  | "action_plan"
  | "report";

const NAV_ITEMS: { key: NavSection; label: string; phase: SessionPhase }[] = [
  { key: "brief", label: "Business brief", phase: "brief" },
  { key: "personas", label: "30 personas", phase: "personas" },
  { key: "survey", label: "Survey", phase: "survey" },
  { key: "focus_group", label: "Focus group", phase: "focus_group" },
  { key: "interviews", label: "Depth interviews", phase: "interviews" },
  { key: "market", label: "Market snapshot", phase: "market" },
  { key: "scoring", label: "GO / NO GO", phase: "scoring" },
  { key: "synthesis", label: "Synthesis", phase: "synthesis" },
  { key: "action_plan", label: "Action plan", phase: "action_plan" },
  { key: "report", label: "Full report", phase: "complete" },
];

const PHASE_ORDER: SessionPhase[] = [
  "intake", "enriching", "brief", "personas", "survey",
  "focus_group", "interviews", "market", "scoring",
  "synthesis", "action_plan", "complete",
];

function phaseIndex(p: SessionPhase) {
  return PHASE_ORDER.indexOf(p);
}

function sectionUnlocked(key: NavSection, phase: SessionPhase): boolean {
  const phaseMap: Record<NavSection, SessionPhase> = {
    brief: "brief",
    personas: "personas",
    survey: "survey",
    focus_group: "focus_group",
    interviews: "interviews",
    market: "market",
    scoring: "scoring",
    synthesis: "synthesis",
    action_plan: "action_plan",
    report: "complete",
  };
  return phaseIndex(phase) >= phaseIndex(phaseMap[key]);
}

function defaultSection(phase: SessionPhase): NavSection {
  if (phaseIndex(phase) >= phaseIndex("complete")) return "report";
  if (phaseIndex(phase) >= phaseIndex("action_plan")) return "action_plan";
  if (phaseIndex(phase) >= phaseIndex("synthesis")) return "synthesis";
  if (phaseIndex(phase) >= phaseIndex("scoring")) return "scoring";
  if (phaseIndex(phase) >= phaseIndex("market")) return "market";
  if (phaseIndex(phase) >= phaseIndex("interviews")) return "interviews";
  if (phaseIndex(phase) >= phaseIndex("focus_group")) return "focus_group";
  if (phaseIndex(phase) >= phaseIndex("survey")) return "survey";
  if (phaseIndex(phase) >= phaseIndex("personas")) return "personas";
  return "brief";
}

// ─── verdict ─────────────────────────────────────────────────────────────────

function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const config = {
    GO: { bg: "bg-emerald-500", label: "GO" },
    GO_WITH_CHANGES: { bg: "bg-amber-400", label: "GO WITH CHANGES" },
    NO_GO: { bg: "bg-red-500", label: "NO GO" },
  }[verdict];
  return (
    <span className={`inline-flex items-center px-4 py-2 rounded-xl text-white font-bold text-lg ${config.bg}`}>
      {config.label}
    </span>
  );
}

// ─── persona card ─────────────────────────────────────────────────────────────

function PersonaCard({ persona, expanded, onToggle }: { persona: SyntheticPersona; expanded: boolean; onToggle: () => void }) {
  const sentimentColor = { low: "text-red-500", medium: "text-amber-500", high: "text-gray-400" }[persona.priceSensitivity];
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <button
        className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-sm font-semibold text-indigo-600">
            {persona.name.charAt(0)}
          </div>
          <div>
            <div className="font-medium text-gray-900 text-sm">{persona.name}</div>
            <div className="text-xs text-gray-400">{persona.age} · {persona.occupation} · {persona.location}</div>
          </div>
        </div>
        <span className="text-gray-400 text-xs">{expanded ? "▲" : "▼"}</span>
      </button>
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-50">
          <p className="text-sm text-gray-600 mt-3 leading-relaxed">{persona.bio}</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs font-medium text-gray-500 mb-1">Motivations</div>
              <BulletList items={persona.motivations} color="green" />
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500 mb-1">Objections</div>
              <BulletList items={persona.objections} color="red" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <Tag color="indigo">{persona.techAttitude}</Tag>
            <Tag color="amber">{persona.spendingAttitude}</Tag>
            <span className={`text-xs font-medium ${sentimentColor}`}>
              price sensitivity: {persona.priceSensitivity}
            </span>
          </div>
          <div className="text-xs text-gray-500 italic">{persona.purchaseContext}</div>
        </div>
      )}
    </div>
  );
}

// ─── score bar ───────────────────────────────────────────────────────────────

function ScoreBar({ score, label, explanation }: { score: number; label: string; explanation: string }) {
  const color = score >= 70 ? "bg-emerald-400" : score >= 45 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-700">{label}</span>
        <span className="text-sm font-semibold text-gray-900">{score}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${score}%` }} />
      </div>
      <p className="text-xs text-gray-500">{explanation}</p>
    </div>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<Session | null>(null);
  const [activeSection, setActiveSection] = useState<NavSection>("brief");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedPersonas, setExpandedPersonas] = useState<Set<string>>(new Set());
  const [editableQuestions, setEditableQuestions] = useState<string[]>([]);
  const [questionsEdited, setQuestionsEdited] = useState(false);

  const fetchSession = useCallback(async () => {
    try {
      const r = await fetch(`/api/sessions/${sessionId}`);
      if (!r.ok) throw new Error("Not found");
      const s: Session = await r.json();
      setSession(s);
      setActiveSection(defaultSection(s.phase));
      if (s.surveyQuestions && !questionsEdited) {
        setEditableQuestions(s.surveyQuestions);
      }
    } catch {
      router.push("/");
    }
  }, [sessionId, router, questionsEdited]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // Auto-enrich brief on load if phase is "enriching"
  useEffect(() => {
    if (session?.phase === "enriching") {
      runApi("enrich-brief", "brief");
    }
  }, [session?.phase]); // eslint-disable-line

  const runApi = async (endpoint: string, nextSection?: NavSection) => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`/api/sessions/${sessionId}/${endpoint}`, { method: "POST" });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.error || "Something went wrong");
      }
      const updated: Session = await r.json();
      setSession(updated);
      if (nextSection) setActiveSection(nextSection);
      if (updated.surveyQuestions && !questionsEdited) {
        setEditableQuestions(updated.surveyQuestions);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const runSurvey = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`/api/sessions/${sessionId}/run-survey`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: editableQuestions }),
      });
      if (!r.ok) throw new Error("Failed to run survey");
      const updated: Session = await r.json();
      setSession(updated);
      setActiveSection("focus_group");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const togglePersona = (id: string) => {
    setExpandedPersonas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  const isEnriching = session.phase === "enriching";

  // ─── section views ─────────────────────────────────────────────────────────

  const views: Record<NavSection, React.ReactNode> = {
    // ── BRIEF ──
    brief: (
      <div>
        {isEnriching ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-400">
            <Spinner />
            <p className="text-sm">AI is analyzing and enriching your brief…</p>
          </div>
        ) : session.brief ? (
          <div className="space-y-8">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {session.brief.basics?.name || "Unnamed idea"}
                </h2>
                <p className="text-gray-500 mt-1">{session.brief.basics?.description}</p>
              </div>
              {session.brief.basics?.type && (
                <Tag color="indigo">{session.brief.basics.type.replace("_", " ")}</Tag>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h4 className="font-semibold text-gray-800 mb-3">Problem & value</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><span className="font-medium">Problem:</span> {session.brief.basics?.problem}</p>
                  <p><span className="font-medium">Value prop:</span> {session.brief.basics?.valueProposition}</p>
                  {session.brief.basics?.whyItWorks && (
                    <p><span className="font-medium">Why it works:</span> {session.brief.basics.whyItWorks}</p>
                  )}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h4 className="font-semibold text-gray-800 mb-3">Target customer</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>{session.brief.customer?.idealCustomer}</p>
                  {session.brief.customer?.ageRange && <p>Age: {session.brief.customer.ageRange}</p>}
                  {session.brief.customer?.incomeLevel && <p>Income: {session.brief.customer.incomeLevel}</p>}
                  {session.brief.customer?.pains && <p>Pains: {session.brief.customer.pains}</p>}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h4 className="font-semibold text-gray-800 mb-3">Market & pricing</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  {session.brief.market?.country && <p>Market: {[session.brief.market.city, session.brief.market.country].filter(Boolean).join(", ")}</p>}
                  {session.brief.market?.launchScope && <p>Scope: {session.brief.market.launchScope}</p>}
                  {session.brief.pricing?.estimatedPrice && <p>Price: {session.brief.pricing.estimatedPrice}</p>}
                  {session.brief.pricing?.monetizationType && <p>Model: {session.brief.pricing.monetizationType.replace("_", " ")}</p>}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h4 className="font-semibold text-gray-800 mb-3">Channels</h4>
                <div className="flex flex-wrap gap-2">
                  {(session.brief.channels?.channels || []).map((ch) => (
                    <Tag key={ch}>{ch}</Tag>
                  ))}
                </div>
                {session.brief.validationObjectives?.length > 0 && (
                  <div className="mt-3">
                    <div className="text-xs font-medium text-gray-500 mb-1.5">Validation goals</div>
                    <div className="flex flex-wrap gap-1.5">
                      {session.brief.validationObjectives.map((o) => (
                        <Tag key={o} color="indigo">{o}</Tag>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {session.brief.aiAssumptions?.length > 0 && (
              <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100">
                <div className="flex items-center gap-2 mb-3">
                  <AiTag />
                  <span className="text-sm font-semibold text-indigo-700">AI-inferred assumptions</span>
                </div>
                <BulletList items={session.brief.aiAssumptions} color="indigo" />
              </div>
            )}

            {!session.personas?.length && (
              <div className="flex justify-center pt-2">
                <Btn onClick={() => runApi("generate-personas", "personas")} loading={loading}>
                  Generate 30 personas →
                </Btn>
              </div>
            )}
          </div>
        ) : null}
      </div>
    ),

    // ── PERSONAS ──
    personas: (
      <div>
        {!session.personas?.length ? (
          <div className="text-center py-20">
            <Btn onClick={() => runApi("generate-personas", "personas")} loading={loading}>
              Generate 30 personas
            </Btn>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {session.personas.length} synthetic personas — generated based on your brief
              </p>
              <Btn variant="outline" onClick={() => runApi("generate-personas", "personas")} loading={loading}>
                Regenerate
              </Btn>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {session.personas.map((p) => (
                <PersonaCard
                  key={p.id}
                  persona={p}
                  expanded={expandedPersonas.has(p.id)}
                  onToggle={() => togglePersona(p.id)}
                />
              ))}
            </div>
            {session.phase === "personas" || session.phase === "survey" ? (
              <div className="flex justify-end pt-4">
                {!session.surveyQuestions?.length ? (
                  <Btn onClick={() => runApi("generate-survey-questions", "survey")} loading={loading}>
                    Generate survey questions →
                  </Btn>
                ) : (
                  <Btn onClick={() => setActiveSection("survey")}>
                    Go to survey →
                  </Btn>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>
    ),

    // ── SURVEY ──
    survey: (
      <div className="space-y-6">
        {!session.surveyResults ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {editableQuestions.length} questions will be answered by all 30 personas
              </p>
              <Btn
                variant="outline"
                onClick={() => {
                  setQuestionsEdited(false);
                  runApi("generate-survey-questions");
                }}
                loading={loading}
              >
                Regenerate questions
              </Btn>
            </div>
            {editableQuestions.length > 0 ? (
              <div className="space-y-3">
                {editableQuestions.map((q, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <span className="text-xs font-bold text-gray-400 mt-3 w-5 flex-shrink-0">{i + 1}</span>
                    <textarea
                      value={q}
                      onChange={(e) => {
                        const updated = [...editableQuestions];
                        updated[i] = e.target.value;
                        setEditableQuestions(updated);
                        setQuestionsEdited(true);
                      }}
                      rows={2}
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none bg-white"
                    />
                  </div>
                ))}
                <div className="flex justify-end pt-2">
                  <Btn onClick={runSurvey} loading={loading}>
                    Run survey across 30 personas →
                  </Btn>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Btn onClick={() => runApi("generate-survey-questions")} loading={loading}>
                  Generate survey questions
                </Btn>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {session.surveyResults.analysis && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {session.surveyResults.analysis.purchaseIntentScore}
                    <span className="text-sm font-normal text-gray-400">/100</span>
                  </div>
                  <div className="text-xs text-gray-500">Purchase intent</div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-4 col-span-2">
                  <div className="text-xs font-medium text-gray-500 mb-2">Key patterns</div>
                  <BulletList items={session.surveyResults.analysis.keyPatterns} />
                </div>
              </div>
            )}

            {session.surveyResults.analysis && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="text-sm font-semibold text-gray-800 mb-3">Purchase drivers</div>
                  <BulletList items={session.surveyResults.analysis.purchaseDrivers} color="green" />
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="text-sm font-semibold text-gray-800 mb-3">Frictions</div>
                  <BulletList items={session.surveyResults.analysis.frictions} color="red" />
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="text-sm font-semibold text-gray-800 mb-3">Price perception</div>
                  <p className="text-sm text-gray-600">{session.surveyResults.analysis.pricePerception}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="text-sm font-semibold text-gray-800 mb-3">Value perception</div>
                  <p className="text-sm text-gray-600">{session.surveyResults.analysis.valuePerception}</p>
                </div>
              </div>
            )}

            <Section title="All questions & answers">
              {session.surveyResults.questions.map((q, qi) => {
                const pos = q.answers.filter((a) => a.sentiment === "positive").length;
                const neg = q.answers.filter((a) => a.sentiment === "negative").length;
                const neu = q.answers.filter((a) => a.sentiment === "neutral").length;
                return (
                  <details key={q.id} className="mb-3 bg-white rounded-xl border border-gray-100">
                    <summary className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50">
                      <span className="text-sm font-medium text-gray-800">
                        {qi + 1}. {q.text}
                      </span>
                      <div className="flex gap-2 text-xs">
                        <span className="text-emerald-600">{pos}↑</span>
                        <span className="text-gray-400">{neu}→</span>
                        <span className="text-red-500">{neg}↓</span>
                      </div>
                    </summary>
                    <div className="px-4 pb-4 space-y-2 border-t border-gray-50">
                      {q.answers.map((a) => {
                        const persona = session.personas?.find((p) => p.id === a.personaId);
                        const sc = { positive: "text-emerald-600", neutral: "text-gray-500", negative: "text-red-500" }[a.sentiment];
                        return (
                          <div key={a.personaId} className="flex gap-3 text-sm pt-2">
                            <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-600 flex-shrink-0 mt-0.5">
                              {persona?.name.charAt(0)}
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">{persona?.name}</span>
                              <span className="text-gray-400 text-xs ml-1">{persona?.age}, {persona?.occupation}</span>
                              <p className={`mt-0.5 ${sc}`}>{a.answer}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </details>
                );
              })}
            </Section>

            {!session.focusGroupGuide && (
              <div className="flex justify-end">
                <Btn onClick={() => runApi("generate-focus-group", "focus_group")} loading={loading}>
                  Set up focus group →
                </Btn>
              </div>
            )}
          </div>
        )}
      </div>
    ),

    // ── FOCUS GROUP ──
    focus_group: (
      <div className="space-y-6">
        {!session.focusGroupGuide ? (
          <div className="text-center py-12">
            <Btn onClick={() => runApi("generate-focus-group")} loading={loading}>
              Generate focus group guide
            </Btn>
          </div>
        ) : !session.focusGroupOutput ? (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  {session.focusGroupGuide.participantIds.length} participants selected from your 30 personas
                </p>
              </div>
              <Btn variant="outline" onClick={() => runApi("generate-focus-group")} loading={loading}>
                Regenerate guide
              </Btn>
            </div>
            <div className="space-y-4">
              {session.focusGroupGuide.topics.map((t, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-4">
                  <div className="font-medium text-gray-800 mb-2">{t.topic}</div>
                  <ul className="space-y-1">
                    {t.questions.map((q, qi) => (
                      <li key={qi} className="text-sm text-gray-500 flex gap-2">
                        <span className="text-gray-300">—</span> {q}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Btn onClick={() => runApi("run-focus-group", "focus_group")} loading={loading}>
                Run focus group simulation →
              </Btn>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Agreements & tensions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="text-sm font-semibold text-gray-800 mb-3">Overall agreements</div>
                <BulletList items={session.focusGroupOutput.overallAgreements} color="green" />
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="text-sm font-semibold text-gray-800 mb-3">Tensions</div>
                <BulletList items={session.focusGroupOutput.tensions} color="amber" />
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="text-sm font-semibold text-gray-800 mb-3">Objections</div>
                <BulletList items={session.focusGroupOutput.objections} color="red" />
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="text-sm font-semibold text-gray-800 mb-3">Conditions to buy</div>
                <BulletList items={session.focusGroupOutput.purchaseConditions} color="indigo" />
              </div>
            </div>

            {/* Topic summaries */}
            <Section title="Discussion by topic">
              <div className="space-y-3">
                {session.focusGroupOutput.topicSummaries.map((ts, i) => (
                  <details key={i} className="bg-white rounded-xl border border-gray-100">
                    <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-gray-800 hover:bg-gray-50">
                      {ts.topic}
                    </summary>
                    <div className="px-4 pb-4 space-y-3 border-t border-gray-50">
                      <div className="pt-3">
                        <div className="text-xs font-medium text-gray-500 mb-1.5">Key insight</div>
                        <p className="text-sm text-gray-700">{ts.keyInsight}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs font-medium text-gray-500 mb-1">Agreements</div>
                          <BulletList items={ts.agreements} color="green" />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-gray-500 mb-1">Disagreements</div>
                          <BulletList items={ts.disagreements} color="red" />
                        </div>
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </Section>

            {/* Quotes */}
            {session.focusGroupOutput.representativeQuotes.length > 0 && (
              <Section title="Representative quotes">
                <div className="space-y-3">
                  {session.focusGroupOutput.representativeQuotes.map((q, i) => {
                    const persona = session.personas?.find((p) => p.id === q.personaId);
                    return (
                      <blockquote key={i} className="bg-gray-50 rounded-xl p-4 border-l-4 border-indigo-200">
                        <p className="text-sm text-gray-700 italic">&quot;{q.quote}&quot;</p>
                        <footer className="mt-2 text-xs text-gray-400">
                          — {persona?.name || q.personaId} · {q.topic}
                        </footer>
                      </blockquote>
                    );
                  })}
                </div>
              </Section>
            )}

            {!session.interviewGuide && (
              <div className="flex justify-end">
                <Btn onClick={() => runApi("generate-interviews", "interviews")} loading={loading}>
                  Set up depth interviews →
                </Btn>
              </div>
            )}
          </div>
        )}
      </div>
    ),

    // ── INTERVIEWS ──
    interviews: (
      <div className="space-y-6">
        {!session.interviewGuide ? (
          <div className="text-center py-12">
            <Btn onClick={() => runApi("generate-interviews")} loading={loading}>
              Generate interview guide
            </Btn>
          </div>
        ) : !session.interviewsOutput ? (
          <div className="space-y-5">
            <p className="text-sm text-gray-500">
              {session.interviewGuide.participantIds.length} depth interviews — covering diverse profiles
            </p>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="text-sm font-semibold text-gray-800 mb-3">Interview guide</div>
              <ol className="space-y-2">
                {session.interviewGuide.questions.map((q, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-600">
                    <span className="font-semibold text-gray-400 flex-shrink-0">{i + 1}.</span>
                    {q}
                  </li>
                ))}
              </ol>
            </div>
            <div className="flex justify-between">
              <Btn variant="outline" onClick={() => runApi("generate-interviews")} loading={loading}>
                Regenerate guide
              </Btn>
              <Btn onClick={() => runApi("run-interviews", "interviews")} loading={loading}>
                Run all 5 interviews →
              </Btn>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100">
              <div className="text-sm font-semibold text-indigo-800 mb-2">Global synthesis</div>
              <p className="text-sm text-indigo-700 leading-relaxed">{session.interviewsOutput.globalSynthesis}</p>
            </div>

            <Section title="Individual interviews">
              <div className="space-y-3">
                {session.interviewsOutput.interviews.map((interview) => {
                  const persona = session.personas?.find((p) => p.id === interview.personaId);
                  return (
                    <details key={interview.personaId} className="bg-white rounded-xl border border-gray-100">
                      <summary className="px-4 py-3 cursor-pointer hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-600">
                            {persona?.name.charAt(0)}
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-800">{persona?.name}</span>
                            <span className="text-xs text-gray-400 ml-2">{persona?.age} · {persona?.occupation}</span>
                          </div>
                        </div>
                      </summary>
                      <div className="px-4 pb-4 border-t border-gray-50 space-y-4">
                        <p className="text-sm text-gray-600 mt-3 leading-relaxed">{interview.summary}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs font-medium text-gray-500 mb-1.5">Would buy because</div>
                            <BulletList items={interview.deepPurchaseReasons} color="green" />
                          </div>
                          <div>
                            <div className="text-xs font-medium text-gray-500 mb-1.5">Wouldn&apos;t buy because</div>
                            <BulletList items={interview.nonPurchaseReasons} color="red" />
                          </div>
                          <div>
                            <div className="text-xs font-medium text-gray-500 mb-1.5">Currently uses</div>
                            <BulletList items={interview.currentAlternatives} />
                          </div>
                          <div>
                            <div className="text-xs font-medium text-gray-500 mb-1.5">Would switch if</div>
                            <BulletList items={interview.triggersToPurchase} color="indigo" />
                          </div>
                        </div>
                        {interview.userLanguage.length > 0 && (
                          <div>
                            <div className="text-xs font-medium text-gray-500 mb-1.5">Their language</div>
                            <div className="flex flex-wrap gap-1.5">
                              {interview.userLanguage.map((l) => (
                                <span key={l} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">&quot;{l}&quot;</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </details>
                  );
                })}
              </div>
            </Section>

            {!session.marketValidation && (
              <div className="flex justify-end">
                <Btn onClick={() => runApi("market-validation", "market")} loading={loading}>
                  Run market validation →
                </Btn>
              </div>
            )}
          </div>
        )}
      </div>
    ),

    // ── MARKET ──
    market: (
      <div className="space-y-6">
        {!session.marketValidation ? (
          <div className="text-center py-12">
            <Btn onClick={() => runApi("market-validation")} loading={loading}>
              Generate market snapshot
            </Btn>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 md:col-span-2">
                <div className="text-sm font-semibold text-gray-800 mb-2">Competitive landscape</div>
                <p className="text-sm text-gray-600 leading-relaxed">{session.marketValidation.competitiveLandscape}</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="text-sm font-semibold text-gray-800 mb-2">Market saturation</div>
                <div className={`text-2xl font-bold ${session.marketValidation.saturationLevel === "low" ? "text-emerald-500" : session.marketValidation.saturationLevel === "medium" ? "text-amber-500" : "text-red-500"}`}>
                  {session.marketValidation.saturationLevel.toUpperCase()}
                </div>
                {session.marketValidation.referencePrice && (
                  <p className="text-xs text-gray-500 mt-2">Reference price: {session.marketValidation.referencePrice}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="text-sm font-semibold text-gray-800 mb-3">Demand signals</div>
                <BulletList items={session.marketValidation.demandSignals} color="green" />
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="text-sm font-semibold text-gray-800 mb-3">Market trends</div>
                <BulletList items={session.marketValidation.marketTrends} color="indigo" />
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="text-sm font-semibold text-gray-800 mb-3">Potential niches</div>
                <BulletList items={session.marketValidation.potentialNiches} color="amber" />
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="text-sm font-semibold text-gray-800 mb-3">Competitive risks</div>
                <BulletList items={session.marketValidation.competitiveRisks} color="red" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="text-sm font-semibold text-gray-800 mb-2">Market appetite</div>
              <p className="text-sm text-gray-600">{session.marketValidation.marketAppetite}</p>
            </div>

            {!session.scoring && (
              <div className="flex justify-end">
                <Btn onClick={() => runApi("score", "scoring")} loading={loading}>
                  Generate GO / NO GO recommendation →
                </Btn>
              </div>
            )}
          </div>
        )}
      </div>
    ),

    // ── SCORING ──
    scoring: (
      <div className="space-y-6">
        {!session.scoring ? (
          <div className="text-center py-12">
            <Btn onClick={() => runApi("score")} loading={loading}>
              Generate recommendation
            </Btn>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Verdict */}
            <div className="bg-white rounded-2xl border border-gray-100 p-7">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Recommendation</div>
                  <VerdictBadge verdict={session.scoring.verdict} />
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400 mb-1">Overall score</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {session.scoring.totalScore}
                    <span className="text-base font-normal text-gray-400">/100</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{session.scoring.verdictExplanation}</p>
            </div>

            {/* Dimension scores */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="text-sm font-semibold text-gray-800 mb-5">Scores by dimension</div>
              <div className="space-y-5">
                {session.scoring.dimensions.map((d) => (
                  <ScoreBar key={d.dimension} score={d.score} label={d.dimension} explanation={d.explanation} />
                ))}
              </div>
            </div>

            {/* Improvements */}
            {session.scoring.suggestedImprovements.length > 0 && (
              <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
                <div className="text-sm font-semibold text-amber-800 mb-3">Suggested improvements</div>
                <BulletList items={session.scoring.suggestedImprovements} color="amber" />
              </div>
            )}

            {!session.synthesis && (
              <div className="flex justify-end">
                <Btn onClick={() => runApi("synthesis", "synthesis")} loading={loading}>
                  Cross-method synthesis →
                </Btn>
              </div>
            )}
          </div>
        )}
      </div>
    ),

    // ── SYNTHESIS ──
    synthesis: (
      <div className="space-y-6">
        {!session.synthesis ? (
          <div className="text-center py-12">
            <Btn onClick={() => runApi("synthesis")} loading={loading}>
              Generate synthesis
            </Btn>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="text-sm font-semibold text-gray-800 mb-3">Repeated patterns</div>
                <BulletList items={session.synthesis.repeatedPatterns} color="indigo" />
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="text-sm font-semibold text-gray-800 mb-3">Strong signals</div>
                <BulletList items={session.synthesis.strongSignals} color="green" />
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="text-sm font-semibold text-gray-800 mb-3">Contradictions</div>
                <BulletList items={session.synthesis.contradictions} color="amber" />
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="text-sm font-semibold text-gray-800 mb-3">Warnings</div>
                <BulletList items={session.synthesis.warnings} color="red" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="text-sm font-semibold text-gray-800 mb-3">Solid findings</div>
                <BulletList items={session.synthesis.solidFindings} color="green" />
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="text-sm font-semibold text-gray-800 mb-3">Still uncertain</div>
                <BulletList items={session.synthesis.uncertainFindings} />
              </div>
            </div>

            <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100">
              <div className="text-sm font-semibold text-indigo-800 mb-3">Hypotheses to validate in the real world</div>
              <BulletList items={session.synthesis.hypothesesToValidate} color="indigo" />
            </div>

            {!session.actionPlan && (
              <div className="flex justify-end">
                <Btn onClick={() => runApi("action-plan", "action_plan")} loading={loading}>
                  Generate action plan →
                </Btn>
              </div>
            )}
          </div>
        )}
      </div>
    ),

    // ── ACTION PLAN ──
    action_plan: (
      <div className="space-y-6">
        {!session.actionPlan ? (
          <div className="text-center py-12">
            <Btn onClick={() => runApi("action-plan")} loading={loading}>
              Generate action plan
            </Btn>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Based on your validation results — concrete next steps to move forward.
            </p>
            {session.actionPlan.steps.map((step, i) => {
              const priorityColor = { high: "red", medium: "amber", low: "gray" }[step.priority] as "red" | "amber" | "gray";
              const catColor = { research: "indigo", product: "indigo", commercial: "green", financial: "amber", marketing: "indigo", legal: "gray", operations: "gray" }[step.category] as "indigo" | "green" | "amber" | "gray";
              return (
                <div key={step.id} className="bg-white rounded-xl border border-gray-100 p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400">{String(i + 1).padStart(2, "0")}</span>
                      <span className="font-semibold text-gray-900">{step.title}</span>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Tag color={priorityColor}>{step.priority}</Tag>
                      <Tag color={catColor}>{step.category}</Tag>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                  {step.rationale && (
                    <p className="text-xs text-gray-400 mt-2 italic">{step.rationale}</p>
                  )}
                </div>
              );
            })}
            <div className="flex justify-end pt-2">
              <Btn onClick={() => setActiveSection("report")}>
                View full report →
              </Btn>
            </div>
          </div>
        )}
      </div>
    ),

    // ── REPORT ──
    report: (
      <div className="space-y-8">
        {/* Executive summary */}
        <div className="bg-white rounded-2xl border border-gray-100 p-7">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-3">Executive summary</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{session.brief?.basics?.name || "Idea validation report"}</h2>
          <p className="text-gray-600 text-sm leading-relaxed">{session.brief?.basics?.description}</p>
          {session.scoring && (
            <div className="flex items-center gap-4 mt-5 pt-5 border-t border-gray-100">
              <VerdictBadge verdict={session.scoring.verdict} />
              <div className="text-sm text-gray-600">{session.scoring.verdictExplanation}</div>
            </div>
          )}
        </div>

        {/* Market */}
        {session.marketValidation && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="text-sm font-semibold text-gray-800 mb-3">Market snapshot</div>
            <p className="text-sm text-gray-600 mb-3">{session.marketValidation.competitiveLandscape}</p>
            <p className="text-sm text-gray-600">{session.marketValidation.marketAppetite}</p>
          </div>
        )}

        {/* Synthesis */}
        {session.synthesis && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="text-sm font-semibold text-gray-800 mb-4">Key findings across all research</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-medium text-gray-500 mb-2">Strong signals</div>
                <BulletList items={session.synthesis.strongSignals} color="green" />
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500 mb-2">Warnings</div>
                <BulletList items={session.synthesis.warnings} color="red" />
              </div>
            </div>
          </div>
        )}

        {/* Scoring table */}
        {session.scoring && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="text-sm font-semibold text-gray-800 mb-4">Validation scores</div>
            <div className="space-y-4">
              {session.scoring.dimensions.map((d) => (
                <ScoreBar key={d.dimension} score={d.score} label={d.dimension} explanation={d.explanation} />
              ))}
            </div>
          </div>
        )}

        {/* Action plan preview */}
        {session.actionPlan && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="text-sm font-semibold text-gray-800 mb-4">What to do next</div>
            <div className="space-y-2">
              {session.actionPlan.steps.slice(0, 5).map((step, i) => (
                <div key={step.id} className="flex items-start gap-3">
                  <span className="text-xs font-bold text-gray-400 mt-0.5">{i + 1}.</span>
                  <div>
                    <span className="text-sm font-medium text-gray-800">{step.title}</span>
                    <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    ),
  };

  // ─── layout ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <aside className="w-52 flex-shrink-0 hidden md:block">
        <div className="sticky top-20">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 px-2">
            Validation
          </div>
          <nav className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const unlocked = sectionUnlocked(item.key, session.phase);
              const isCurrent = activeSection === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => unlocked && setActiveSection(item.key)}
                  disabled={!unlocked}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                    isCurrent
                      ? "bg-gray-900 text-white font-medium"
                      : unlocked
                      ? "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      : "text-gray-300 cursor-not-allowed"
                  }`}
                >
                  <span>{item.label}</span>
                  {unlocked && !isCurrent && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900 truncate">
            {session.brief?.basics?.name || "Validating your idea"}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5 truncate">
            {session.brief?.basics?.description}
          </p>
        </div>

        {/* Mobile nav */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 md:hidden">
          {NAV_ITEMS.filter((item) => sectionUnlocked(item.key, session.phase)).map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveSection(item.key)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeSection === item.key
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-5 text-red-600 text-sm p-3 bg-red-50 rounded-xl border border-red-100">
            {error}
          </div>
        )}

        {/* Section content */}
        <div>{views[activeSection]}</div>
      </main>
    </div>
  );
}
