import { NextResponse } from "next/server";

import { createTanzaku, getTanzakuUserId, listTanzaku, TanzakuAuthError } from "@/lib/server/tanzaku-store";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = await getTanzakuUserId(request.headers.get("Authorization"));
    const items = await listTanzaku(userId, url.searchParams.get("status") ?? undefined);
    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "短冊を取得できませんでした" }, { status: error instanceof TanzakuAuthError ? error.status : 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userId = await getTanzakuUserId(request.headers.get("Authorization"));
    const item = await createTanzaku({
      dream: typeof body?.dream === "string" ? body.dream : "",
      deadline: body?.deadline,
    }, userId);
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "短冊を作成できませんでした" },
      { status: error instanceof TanzakuAuthError ? error.status : 400 },
    );
  }
}
