import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "Use /run-survey instead" }, { status: 410 });
}
