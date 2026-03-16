import { Session } from "@/types";
import Link from "next/link";

interface SessionCardProps {
  session: Session;
}

export function SessionCard({ session }: SessionCardProps) {
  return (
    <Link href={`/sessions/${session.id}`}>
      <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-300 hover:shadow-sm transition-all">
        <div className="text-xs text-gray-400 mb-2">{session.phase}</div>
        <h3 className="font-semibold text-gray-900 mb-1">
          {session.brief?.basics?.name || "Unnamed idea"}
        </h3>
        <p className="text-gray-400 text-sm line-clamp-2">
          {session.brief?.basics?.description || "No description"}
        </p>
      </div>
    </Link>
  );
}
