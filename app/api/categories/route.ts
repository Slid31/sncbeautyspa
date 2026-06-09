import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest) {
  return NextResponse.json({ categories: [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  return NextResponse.json({ category: body }, { status: 201 });
}
