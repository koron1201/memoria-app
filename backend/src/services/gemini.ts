import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

// 環境変数からAPIキーを取得
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Geminiに返してほしいデータの形（スキーマ）を定義
const schema = {
  description: "感情分析と日記生成の結果",
  type: SchemaType.OBJECT as const,
  properties: {
    emotion: { 
      type: SchemaType.STRING as const, 
      description: "その時の感情を一言で（例：ワクワク、穏やか、少し寂しい）" 
    },
    animalId: { 
      type: SchemaType.STRING as const, 
      description: "cat(自由), rabbit(繊細), lion(活発), bear(穏やか), fox(好奇心) のいずれか一つ" 
    },
    diaryText: { 
      type: SchemaType.STRING as const, 
      description: "200文字程度の、ユーザーに寄り添うエモい日記文章" 
    },
  },
  required: ["emotion", "animalId", "diaryText"],
};

/**
 * 画像とテキストをGeminiに送り、解析結果を返す関数
 */
export async function analyzeMemory(imageBuffer: Buffer, userText: string, mimeType: string) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  // 画像データをGeminiが読めるBase64形式に変換
  const imagePart = {
    inlineData: {
      data: imageBuffer.toString("base64"),
      mimeType: mimeType, // フロントから送られる形式に合わせる
    },
  };

  const prompt = `
    あなたはユーザーの思い出を鮮やかに言語化し、その深層心理を動物に例える専門家です。
    写真の雰囲気とメッセージ「${userText}」から、以下の3点を抽出してください。

    1. **diaryText (200文字程度)**:
       ユーザー本人の一人称（私、僕など）で、その瞬間の空気感や色彩、隠れた感情を綴ったエモい日記を書いてください。
    2. **animalId**:
       性格特性から以下より1つ選択（lion:情熱, rabbit:繊細, cat:自由, bear:穏やか, fox:好奇心）。
    3. **emotion**:
       その時の気分を「ワクワク」「しっとり」など一言で。

    必ず指定されたJSON形式で出力してください。
  `;

  try {
    const result = await model.generateContent([prompt, imagePart]);
    const response = result.response;
    return JSON.parse(response.text());
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // 【修正】 cause: error を追加して、元のエラー情報を保持する
    throw new Error("AI解析に失敗しました", { cause: error });
  }
}