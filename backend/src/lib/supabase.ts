// backend/src/lib/supabase.ts

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

// デバッグ用にログを仕込む
console.log("=== Supabase 設定チェック ===");
console.log("URL:", process.env.SUPABASE_URL);
console.log("KEYが存在するか:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log("=============================");

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// 👇 短冊機能（tanzaku.ts）向けに通常用の変数名としてもエクスポートする
export const supabase = supabaseAdmin;

/**
 * フロントから送られた Authorization ヘッダー（Bearer トークン）を検証し、ユーザー情報を返す
 */
export async function getAuthUser(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized: 認証トークンがありません')
  }

  const token = authHeader.split(' ')[1]

  // Supabaseにトークンを投げ、現在ログイン中の本物ユーザーか検証する
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

  if (error || !user) {
    throw new Error('Unauthorized: 不正なトークンです')
  }

  return user
}