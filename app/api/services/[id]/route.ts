import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  return NextResponse.json({ id });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  return NextResponse.json({ id, ...body });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  return NextResponse.json({ deleted: id });
}
