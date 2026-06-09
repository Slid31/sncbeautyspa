import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest) {
  return NextResponse.json({ appointments: [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  // TODO: create appointment logic
  return NextResponse.json({ appointment: body }, { status: 201 });
}
