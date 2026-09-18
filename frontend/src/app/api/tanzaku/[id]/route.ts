import { NextResponse } from "next/server";

import { getTanzaku, getTanzakuUserId, TanzakuAuthError, updateTanzaku } from "@/lib/server/tanzaku-store";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let item;
  try {
    item = await getTanzaku(id, await getTanzakuUserId(request.headers.get("Authorization")));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "短冊を取得できませんでした" }, { status: error instanceof TanzakuAuthError ? error.status : 500 });
  }
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
  let item;
  try {
    item = await updateTanzaku(id, await getTanzakuUserId(request.headers.get("Authorization")), {
      steps: Array.isArray(body.steps) ? body.steps : undefined,
      reflection: typeof body.reflection === "string" ? body.reflection : undefined,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "短冊を更新できませんでした" }, { status: error instanceof TanzakuAuthError ? error.status : 500 });
  }
  if (!item) {
    return NextResponse.json({ error: "短冊が見つかりません" }, { status: 404 });
  }
  return NextResponse.json(item);
}
