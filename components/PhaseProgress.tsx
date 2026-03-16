import { SessionPhase } from "@/types";

interface PhaseProgressProps {
  current: SessionPhase;
}

export function PhaseProgress({ current }: PhaseProgressProps) {
  return (
    <div className="inline-flex items-center gap-1.5 text-xs font-medium bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
      {current.replace("_", " ")}
    </div>
  );
}
