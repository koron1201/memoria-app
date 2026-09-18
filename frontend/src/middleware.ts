import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

// 未ログインでもアクセスできるパス
const PUBLIC_PATHS = ['/onboarding', '/auth/callback', '/auth', '/login']

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const { pathname } = req.nextUrl

  // 公開パスはスルー
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return res
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cs) =>
          cs.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          ),
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // 未ログインならオンボーディングへ
  if (!session) {
    return NextResponse.redirect(new URL('/onboarding', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}