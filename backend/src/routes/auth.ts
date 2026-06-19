// backend/src/routes/auth.ts
import { Hono } from 'hono'
import { supabaseAdmin, getAuthUser } from '../lib/supabase'

const router = new Hono()

// POST /api/auth/session
router.post('/session', async (c) => {
  try {
    // トークン検証（Honoでは c.req.header('Authorization') でヘッダーを取得します）
    const authHeader = c.req.header('Authorization') || null
    const user = await getAuthUser(authHeader)

    // Googleから渡されたユーザーメタデータを取得
    const { id, email } = user
    const display_name = user.user_metadata?.full_name || 'ゲストユーザー'
    const avatar_url = user.user_metadata?.avatar_url || ''

    // profiles テーブルにデータを保存（すでに存在すれば更新：Upsert）
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .upsert({ id, email, display_name, avatar_url })
      .select()
      .single()

    if (error) throw error

    // Honoのレスポンス返却スタイル
    return c.json({ success: true, profile: data }, 200)
    
  } catch (error: any) {
    console.error("Auth Session Error:", error)
    return c.json({ success: false, message: error.message }, 401)
  }
})

export default router