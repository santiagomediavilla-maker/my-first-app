import { createClient } from "@supabase/supabase-js";
import { Session } from "@/types";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function readSession(id: string): Promise<Session | null> {
  const { data, error } = await supabase
    .from("sessions")
    .select("data")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data.data as Session;
}

export async function writeSession(session: Session): Promise<void> {
  await supabase
    .from("sessions")
    .upsert({ id: session.id, data: session });
}

export async function listSessions(): Promise<Session[]> {
  const { data, error } = await supabase
    .from("sessions")
    .select("data")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map((row) => row.data as Session);
}
