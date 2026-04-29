import { NextResponse } from "next/server";

import { getTanzaku, updateTanzaku } from "@/lib/server/tanzaku-store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const item = await getTanzaku(id);
  if (!item) {
    return NextResponse.json({ error: "短冊が見つかりません" }, { status: 404 });
  }
  return NextResponse.json(item);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const item = await updateTanzaku(id, {
    steps: Array.isArray(body.steps) ? body.steps : undefined,
    reflection: typeof body.reflection === "string" ? body.reflection : undefined,
  });
  if (!item) {
    return NextResponse.json({ error: "短冊が見つかりません" }, { status: 404 });
  }
  return NextResponse.json(item);
}
