import { NextResponse } from "next/server";
import { listSessions, writeSession } from "@/lib/storage";
import { generateId } from "@/lib/utils";
import { Session, BusinessIdeaBrief } from "@/types";

export async function GET() {
  try {
    const sessions = await listSessions();
    return NextResponse.json(sessions);
  } catch {
    return NextResponse.json({ error: "Failed to list sessions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const brief: Partial<BusinessIdeaBrief> = body.brief;

    if (!brief) {
      return NextResponse.json({ error: "Missing brief" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const session: Session = {
      id: generateId(),
      createdAt: now,
      updatedAt: now,
      phase: "enriching",
      brief: brief as BusinessIdeaBrief,
    };

    await writeSession(session);
    return NextResponse.json(session, { status: 201 });
  } catch (err) {
    console.error("POST /api/sessions error:", err);
    return NextResponse.json({ error: "Failed to create session", detail: String(err) }, { status: 500 });
  }
}
