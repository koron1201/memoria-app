import { NextResponse } from "next/server";

import { createTanzaku, listTanzaku } from "@/lib/server/tanzaku-store";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const items = await listTanzaku(url.searchParams.get("status") ?? undefined);
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const item = await createTanzaku({
      dream: typeof body.dream === "string" ? body.dream : "",
      deadline: typeof body.deadline === "string" ? body.deadline : null,
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "短冊を作成できませんでした" },
      { status: 400 },
    );
  }
}
