import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// フロントエンド（ブラウザ）から安全に叩くためのクライアント
export const supabase = createClient(supabaseUrl, supabaseAnonKey)