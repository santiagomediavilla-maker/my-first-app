import { listSessions } from "@/lib/storage";
import Link from "next/link";
import { Session } from "@/types";

export const dynamic = "force-dynamic";

function phaseLabel(phase: Session["phase"]) {
  const labels: Record<Session["phase"], string> = {
    intake: "Intake",
    enriching: "Processing",
    brief: "Brief ready",
    personas: "Personas",
    survey: "Survey",
    focus_group: "Focus group",
    interviews: "Interviews",
    market: "Market",
    scoring: "Scoring",
    synthesis: "Synthesis",
    action_plan: "Action plan",
    complete: "Complete",
  };
  return labels[phase] || phase;
}

function phaseColor(phase: Session["phase"]) {
  if (phase === "complete") return "bg-emerald-100 text-emerald-700";
  if (["scoring", "synthesis", "action_plan"].includes(phase)) return "bg-indigo-100 text-indigo-700";
  if (["survey", "focus_group", "interviews", "market"].includes(phase)) return "bg-amber-100 text-amber-700";
  return "bg-gray-100 text-gray-600";
}

export default async function HomePage() {
  let sessions: Session[] = [];
  try {
    sessions = await listSessions();
  } catch (err) {
    console.error("Failed to load sessions:", err);
  }

  return (
    <div className="space-y-16">
      {/* Hero */}
      <div className="text-center py-16 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 tracking-wide uppercase">
          AI-powered research simulation
        </div>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-5 tracking-tight">
          Validate your business idea<br />before you build it
        </h1>
        <p className="text-xl text-gray-500 max-w-xl mx-auto mb-8 leading-relaxed">
          Survey, focus group, and depth interviews — simulated by AI across 30 realistic personas.
          Get a GO / NO GO recommendation in minutes.
        </p>
        <Link
          href="/sessions/new"
          className="inline-flex items-center gap-2 bg-gray-900 text-white px-7 py-3.5 rounded-xl text-base font-semibold hover:bg-gray-700 transition-colors"
        >
          Start validation
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon: "🎯",
            title: "Idea intake",
            desc: "Answer a few structured questions about your idea. AI fills in the gaps and builds a complete business brief.",
          },
          {
            icon: "👥",
            title: "30 synthetic personas",
            desc: "AI generates 30 realistic, diverse profiles that represent your target market. Not clones — real variety.",
          },
          {
            icon: "📊",
            title: "3 research methods",
            desc: "Survey, focus group, and depth interviews — all simulated against your personas to reveal what's solid and what's risky.",
          },
        ].map((f) => (
          <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Recent sessions */}
      {sessions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent validations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((session) => (
              <Link
                key={session.id}
                href={`/sessions/${session.id}`}
                className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-gray-300 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${phaseColor(session.phase)}`}
                  >
                    {phaseLabel(session.phase)}
                  </span>
                  <svg
                    className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 truncate">
                  {session.brief?.basics?.name || "Unnamed idea"}
                </h3>
                <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">
                  {session.brief?.basics?.description || "No description"}
                </p>
                <div className="mt-3 text-xs text-gray-400">
                  {new Date(session.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
