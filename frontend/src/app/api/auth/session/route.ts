import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase server environment variables are not configured");
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  try {
    const authorization = req.headers.get("Authorization");
    const token = authorization?.startsWith("Bearer ")
      ? authorization.slice("Bearer ".length)
      : null;

    if (!token) {
      return NextResponse.json({ success: false, message: "認証トークンがありません" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user) {
      return NextResponse.json({ success: false, message: "不正なトークンです" }, { status: 401 });
    }

    const user = authData.user;
    const { data, error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        email: user.email ?? null,
        display_name: user.user_metadata?.full_name || "ゲストユーザー",
        avatar_url: user.user_metadata?.avatar_url || "",
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, profile: data });
  } catch (error) {
    console.error("Auth Session Error:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "認証エラーが発生しました" },
      { status: 500 },
    );
  }
}
