import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase server environment variables are not configured");
  }
  return createClient(url, key);
}

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

async function analyzeMemory(image: File, userText: string) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not configured");

  const bytes = Buffer.from(await image.arrayBuffer());
  const prompt = `あなたは、写真と短いメモから「その時、本人が心の奥で感じていたはずの言葉」を紡ぎ出す詩人です。

【入力】
・写真の画像データ
・ユーザーの短いメモ: 「${userText}」

【あなたの任務】
1. ユーザーのメモを素材に、200文字程度の日記を一人称で創作してください。
2. animalId は cat, bear, fox, mouse, dog, penguin のいずれか1つにしてください。

JSONのみで、emotion, animalId, diaryText を返してください。`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: bytes.toString("base64"),
                mimeType: image.type || "image/jpeg",
              },
            },
          ],
        }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    },
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`AI解析に失敗しました: ${message}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("AI解析結果を取得できませんでした");

  const parsed = JSON.parse(text) as {
    emotion?: string;
    animalId?: string;
    diaryText?: string;
  };

  const allowedAnimals = new Set(["cat", "bear", "fox", "mouse", "dog", "penguin"]);
  if (!parsed.diaryText || !parsed.emotion || !parsed.animalId || !allowedAnimals.has(parsed.animalId)) {
    throw new Error("AI解析結果の形式が不正です");
  }

  return {
    emotion: parsed.emotion,
    animalId: parsed.animalId,
    diaryText: parsed.diaryText,
  };
}

export async function POST(req: NextRequest) {
  try {
    const authorization = req.headers.get("Authorization");
    const accessToken = authorization?.startsWith("Bearer ")
      ? authorization.slice("Bearer ".length)
      : null;

    if (!accessToken) {
      return NextResponse.json({ error: "ログイン情報が見つかりません。" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const { data: authData, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !authData.user) {
      return NextResponse.json({ error: "ログイン情報を確認できませんでした。" }, { status: 401 });
    }

    const formData = await req.formData();
    const image = formData.get("image");
    const userText = typeof formData.get("text") === "string" ? String(formData.get("text")) : "";

    if (!(image instanceof File)) {
      return NextResponse.json({ error: "画像を選択してください" }, { status: 400 });
    }

    const result = await analyzeMemory(image, userText);
    const fileName = `${Date.now()}_${toSafeStorageName(image.name)}`;
    const filePath = `uploads/${fileName}`;
    const buffer = Buffer.from(await image.arrayBuffer());

    const { error: storageError } = await supabase.storage
      .from("memories")
      .upload(filePath, buffer, { contentType: image.type || "image/jpeg" });

    if (storageError) throw new Error(`画像のアップロードに失敗しました: ${storageError.message}`);

    const { data: publicData } = supabase.storage.from("memories").getPublicUrl(filePath);

    const { data: dbData, error: dbError } = await supabase
      .from("memories")
      .insert({
        user_id: authData.user.id,
        image_url: publicData.publicUrl,
        diary_text: result.diaryText,
        emotion: result.emotion,
        animal_id: result.animalId,
      })
      .select()
      .single();

    if (dbError) throw new Error(`データの保存に失敗しました: ${dbError.message}`);

    return NextResponse.json({
      id: dbData.id,
      ...result,
      imageUrl: publicData.publicUrl,
    });
  } catch (error) {
    console.error("Analysis Route Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "解析に失敗しました。" },
      { status: 500 },
    );
  }
}
