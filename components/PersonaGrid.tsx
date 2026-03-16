import { SyntheticPersona } from "@/types";
import { PersonaCard } from "./PersonaCard";

interface PersonaGridProps {
  personas: SyntheticPersona[];
  sessionId: string;
  loading?: boolean;
}

export function PersonaGrid({ personas, sessionId, loading }: PersonaGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-100 rounded-xl h-24 animate-pulse" />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {personas.map((persona) => (
        <PersonaCard key={persona.id} persona={persona} sessionId={sessionId} />
      ))}
    </div>
  );
}
