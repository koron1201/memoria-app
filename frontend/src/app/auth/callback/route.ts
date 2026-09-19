import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/'
  const cookieStore = await cookies()
  
  // 認証後に戻る画面を先に決めておく。Supabase SSR はこのレスポンスへログインCookieを書き込む。
  const res = NextResponse.redirect(new URL(next, req.url))

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          // Next.js側のCookieと、ブラウザへ返すレスポンスCookieの両方にセッションを反映する。
          setAll: (cs) =>
            cs.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
              res.cookies.set(name, value, options)
            }),
        },
      }
    )

    try {
      // Googleから返ってきたcodeをSupabaseのログインセッションへ交換する。
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error && data.session) {
        // AuthユーザーはSupabaseが管理するが、public.profilesはアプリ側テーブルなので明示的に同期する。
        const syncRes = await fetch(new URL('/api/auth/session', req.url), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${data.session.access_token}`,
          },
        });

        if (!syncRes.ok) {
          const message = await syncRes.text()
          console.error("⚠️ バックエンドへのセッション同期に失敗しました:", message)
        }
      } else if (error) {
        console.error("❌ Supabase セッション交換エラー:", error.message)
      }
    } catch (err) {
      console.error("❌ コールバック処理中の予期せぬエラー:", err)
    }
  }

  // セッションCookieが入ったレスポンスを返し、nextで指定された画面へ戻す。
  return res
}
