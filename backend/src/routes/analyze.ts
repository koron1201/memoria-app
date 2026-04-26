import { Hono } from 'hono';
import { analyzeMemory } from '../services/gemini';
import { supabase } from '../lib/supabase'; // 先ほど作ったsupabaseクライアントをimport

const router = new Hono();

/**
 * POST /api/analyze
 * 画像とテキストを解析する
 */
router.post('/', async (c) => {
  try {
    // フォームデータを受け取る
    const body = await c.req.parseBody();
    const imageFile = body['image'];
    const userText = (body['text'] as string) || "";

    // 画像が File オブジェクトかチェック（instanceof File で型を絞り込む）
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
      imageFile.type // "image/jpeg" など
    );
    //Supabase Storage に画像をアップロード
    const fileName = `${Date.now()}_${imageFile.name}`;
    const filePath = `uploads/${fileName}`;

    const { data: storageData, error: storageError } = await supabase.storage
      .from('memories') // 作成したバケット名
      .upload(filePath, buffer, {
        contentType: imageFile.type,
      });

    if (storageError) {
      console.error("Storage Error:", storageError);
      throw new Error("画像のアップロードに失敗しました");
    }

    // 公開URLを取得 (ここで publicUrl を定義します)
    const { data: { publicUrl } } = supabase.storage
      .from('memories')
      .getPublicUrl(filePath);

    // Database (memoriesテーブル) に保存
    const { data: dbData, error: dbError } = await supabase
      .from('memories')
      .insert({
        image_url: publicUrl,
        diary_text: result.diaryText, // Geminiが生成したエモい日記テキスト
        emotion: result.emotion, // Geminiが判定した感情
        animal_id: result.animalId, // Geminiが判定した動物ID
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database Error:", dbError);
      throw new Error("データの保存に失敗しました");
    }

    //保存されたレコードのIDと解析結果をフロントに返す
    return c.json({
      id: dbData.id,
      ...result,
      imageUrl: publicUrl
    });
    
  } catch (error) {
    // 【修正】 error: any をやめて、安全なログ出力にする
    console.error("Analysis Route Error:", error);
    return c.json({ error: "AI解析中にエラーが発生しました" }, 500);
  }
});

export default router;