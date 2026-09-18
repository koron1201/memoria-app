import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// OAuth後に /auth/callback で code を交換できるよう、SSR対応のブラウザクライアントを使う。
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
