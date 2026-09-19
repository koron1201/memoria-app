import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cs) =>
          cs.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          }),
      },
    },
  );

  // ブラウザからbackendを直叩きせず、Next側でログインCookieからアクセストークンを取り出す。
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session?.access_token) {
    return NextResponse.json(
      { error: "AI解析を行うにはログインが必要です" },
      { status: 401 },
    );
  }

  const formData = await req.formData();

  // backendのgetAuthUser()が検証できるように、サーバー側でBearerトークンを付け直す。
  const res = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "X-Memoria-Client": "next-api-analyze-v1",
    },
    body: formData,
  });

  const text = await res.text();

  return new NextResponse(text, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("Content-Type") ?? "application/json",
    },
  });
}
