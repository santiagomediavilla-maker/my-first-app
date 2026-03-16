import { NextResponse } from "next/server";
import { readSession, writeSession } from "@/lib/storage";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const session = readSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }
  return NextResponse.json(session);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const session = readSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const updates = await request.json();
  const updated = {
    ...session,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  writeSession(updated);
  return NextResponse.json(updated);
}
