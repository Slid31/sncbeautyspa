import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest) {
  return NextResponse.json({ services: [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  return NextResponse.json({ service: body }, { status: 201 });
}
