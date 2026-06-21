import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const cookieStore = await cookies()
  
  // 💡 1. 最初にリダイレクト用のレスポンスオブジェクトを用意する
  // これにより、Supabase SSR がこのレスポンスに対して安全にクッキーヘッダーを注入できるようになります
  const res = NextResponse.redirect(new URL('/', req.url))

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          // 💡 2. cookieStoreだけでなく、用意したレスポンス(res)のクッキーにも同期させる
          setAll: (cs) =>
            cs.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
              res.cookies.set(name, value, options)
            }),
        },
      }
    )

    try {
      // Googleから返ってきたcodeをセッションに変換
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error && data.session) {
        // 💡 3. Dockerコンテナ間通信のURL解決
        // サーバーサイド(Node.js環境)でのfetchの場合、localhostではなくコンテナサービス名(http://backend:3001)で叩くのが確実です。
        // もし動かない場合は、一旦通信エラーで落ちないように try-catch で保護します。
        const apiUrl = process.env.NODE_ENV === 'production' 
          ? process.env.NEXT_PUBLIC_API_URL 
          : 'http://backend:3001'; // Docker Composeのサービス名

        await fetch(`${apiUrl}/api/auth/session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${data.session.access_token}`,
          },
        }).catch(err => {
          console.error("⚠️ バックエンドへのセッション同期に失敗しました（コンテナ間通信エラー）:", err.message);
          // ここでエラーになっても、認証自体は成功しているのでアプリがクラッシュ(500)しないように受け流す
        });
      } else if (error) {
        console.error("❌ Supabase セッション交換エラー:", error.message)
      }
    } catch (err) {
      console.error("❌ コールバック処理中の予期せぬエラー:", err)
    }
  }

  // 💡 4. クッキーが正しく注入されたレスポンスを返す
  return res
}