import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "Use /synthesis instead" }, { status: 410 });
}
