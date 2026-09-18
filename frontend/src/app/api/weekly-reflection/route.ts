import { NextResponse } from "next/server";

import { getCurrentWeeklyReflection } from "@/lib/server/weekly-reflection-store";

export async function GET(request: Request) {
  try {
    const authorization = request.headers.get("Authorization");
    const accessToken = authorization?.startsWith("Bearer ")
      ? authorization.slice("Bearer ".length)
      : null;
    return NextResponse.json({ item: await getCurrentWeeklyReflection(accessToken) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "週間コメントを取得できませんでした。" },
      { status: 500 },
    );
  }
}
