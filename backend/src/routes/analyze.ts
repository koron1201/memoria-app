import { Hono } from "hono";

import { analyzeMemory } from "../services/gemini";
import { supabaseAdmin } from "../lib/supabase";

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
router.post("/", async (c) => {
  try {
    // Authorizationヘッダーからアクセストークンを取得
    const authorization = c.req.header("Authorization");

    const accessToken = authorization?.startsWith("Bearer ")
      ? authorization.slice("Bearer ".length)
      : null;

    if (!accessToken) {
      return c.json(
        {
          error:
            "ログイン情報が見つかりません。もう一度ログインしてください。",
        },
        401
      );
    }

    // アクセストークンを検証して、ログイン中のユーザーを取得
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.getUser(accessToken);

    if (authError || !authData.user) {
      return c.json(
        {
          error:
            "ログイン情報を確認できませんでした。もう一度ログインしてください。",
        },
        401
      );
    }

    // フォームデータを受け取る
    const body = await c.req.parseBody();
    const imageFile = body["image"];
    const userText =
      typeof body["text"] === "string" ? body["text"] : "";

    // 画像がFileオブジェクトかチェック
    if (!imageFile || !(imageFile instanceof File)) {
      return c.json(
        {
          error: "画像を選択してください",
        },
        400
      );
    }

    // FileをBufferに変換
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Gemini解析の呼び出し
    const result = await analyzeMemory(
      buffer,
      userText,
      imageFile.type
    );

    // Supabase Storageに保存するファイル名を作成
    const fileName =
      `${Date.now()}_${toSafeStorageName(imageFile.name)}`;

    const filePath = `uploads/${fileName}`;

    // Supabase Storageに画像をアップロード
    const { error: storageError } = await supabaseAdmin.storage
      .from("memories")
      .upload(filePath, buffer, {
        contentType: imageFile.type,
      });

    if (storageError) {
      console.error("Storage Error:", storageError);

      throw new Error(
        `画像のアップロードに失敗しました: ${storageError.message}`
      );
    }

    // アップロードした画像の公開URLを取得
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage
      .from("memories")
      .getPublicUrl(filePath);

    // memoriesテーブルに解析結果を保存
    const { data: dbData, error: dbError } = await supabaseAdmin
      .from("memories")
      .insert({
        user_id: authData.user.id,
        image_url: publicUrl,
        diary_text: result.diaryText,
        emotion: result.emotion,
        animal_id: result.animalId,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database Error:", dbError);

      throw new Error(
        `データの保存に失敗しました: ${dbError.message}`
      );
    }

    // 保存されたレコードのIDと解析結果をフロントへ返す
    return c.json({
      id: dbData.id,
      ...result,
      imageUrl: publicUrl,
    });
  } catch (error) {
    console.error("Analysis Route Error:", error);

    if (error instanceof Error) {
      return c.json(
        {
          error: error.message,
        },
        500
      );
    }

    return c.json(
      {
        error: "解析に失敗しました。",
      },
      500
    );
  }
});

export default router;