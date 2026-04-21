import { Hono } from 'hono';
import { analyzeMemory } from '../services/gemini';

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

    // 画像が File オブジェクトかチェック
    if (!(imageFile instanceof File)) {
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

    return c.json(result);
  } catch (error: any) {
    console.error("Analysis Route Error:", error);
    return c.json({ error: "AI解析中にエラーが発生しました" }, 500);
  }
});

export default router;