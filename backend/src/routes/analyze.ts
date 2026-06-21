import { Hono } from 'hono';
import { analyzeMemory } from '../services/gemini';
// 【修正】エクスポート名に合わせて、supabaseAdmin と getAuthUser をインポート
import { supabaseAdmin, getAuthUser } from '../lib/supabase'; 

const router = new Hono();

function toSafeStorageName(name: string) {
  const extMatch = name.match(/\.[A-Za-z0-9]+$/);
  const ext = extMatch?.[0]?.toLowerCase() ?? "";
  const base = ext ? name.slice(0, -ext.length) : name;
  const normalized = base
    .normalize("NFKD")
    .replace(/[^\u0020-\u007E]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  return `${normalized || "image"}${ext}`;
}

/**
 * POST /api/analyze
 * 画像とテキストを解析し、ログイン中のユーザーの思い出として保存する
 */
router.post('/', async (c) => {
  try {
    // 【★認証の追加】ヘッダーからトークンを検証し、Googleログイン中のユーザーを特定
    const authHeader = c.req.header('Authorization') || null;
    console.log('AuthHeader:', authHeader) // ← 追加
    const user = await getAuthUser(authHeader);
    console.log('User ID:', user.id) // ← 追加

    // ★ profilesテーブルにユーザーを自動登録
    await supabaseAdmin
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email!,
        display_name: user.user_metadata?.full_name || 'ゲストユーザー',
        avatar_url: user.user_metadata?.avatar_url || '',
      }, { onConflict: 'id' })

    // フォームデータを受け取る
    const body = await c.req.parseBody();
    const imageFile = body['image'];
    const userText = (body['text'] as string) || "";

    // 画像が File オブジェクトかチェック
    if (!imageFile || !(imageFile instanceof File)) {
      return c.json({ error: "画像を選択してください" }, 400);
    }

    // File を Buffer に変換
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Gemini 解析の呼び出し
    const result = await analyzeMemory(
      buffer,
      userText,
      imageFile.type
    );

    // Supabase Storage に画像をアップロード
    const fileName = `${Date.now()}_${toSafeStorageName(imageFile.name)}`;
    const filePath = `uploads/${fileName}`;

    // 【修正】supabase -> supabaseAdmin に変更
    const { error: storageError } = await supabaseAdmin.storage
      .from('memories')
      .upload(filePath, buffer, {
        contentType: imageFile.type,
      });

    if (storageError) {
        console.error("Storage Error:", storageError);
        throw new Error("画像のアップロードに失敗しました");
    }

    // 公開URLを取得
    // 【修正】supabase -> supabaseAdmin に変更
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('memories')
      .getPublicUrl(filePath);

    // Database (memoriesテーブル) に保存
    // 【修正】supabase -> supabaseAdmin に変更
    const { data: dbData, error: dbError } = await supabaseAdmin
      .from('memories')
      .insert({
        user_id: user.id,            // ★ここで特定したGoogleユーザーのUUIDを紐付け！
        image_url: publicUrl,
        diary_text: result.diaryText,
        emotion: result.emotion,
        animal_id: result.animalId,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database Error:", dbError);
      throw new Error("データの保存に失敗しました");
    }

    // 保存されたレコードのIDと解析結果をフロントに返す
    return c.json({
      id: dbData.id,
      ...result,
      imageUrl: publicUrl
    });
    
  } catch (error) { // ← ": any" を削除
    console.error("Analysis Route Error:", error);
    
    // error がオブジェクトであり、message プロパティを持っているかチェック（型安全なガード）
    const errorMessage = error instanceof Error ? error.message : "";
    
    // 認証エラーの場合は401を返すように少し親切に分岐
    if (errorMessage.includes('Unauthorized')) {
      return c.json({ error: errorMessage }, 401);
    }
    
    return c.json({ error: "AI解析中にエラーが発生しました" }, 500);
  }
});

export default router;