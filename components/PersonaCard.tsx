import { SyntheticPersona } from "@/types";

interface PersonaCardProps {
  persona: SyntheticPersona;
  sessionId: string;
}

export function PersonaCard({ persona }: PersonaCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-semibold text-indigo-600">
          {persona.name.charAt(0)}
        </div>
        <div>
          <div className="font-medium text-gray-900 text-sm">{persona.name}</div>
          <div className="text-xs text-gray-400">{persona.age} · {persona.occupation}</div>
        </div>
      </div>
      <p className="text-sm text-gray-500 leading-relaxed">{persona.bio}</p>
    </div>
  );
}
