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
      description: "cat(自由), bear(穏やか), fox(好奇心), mouse(寂しい), dog(親しみ), penguin(愛らしい) のいずれか一つ"
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
    model: "gemini-2.5-flash",
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
    あなたは、写真と短いメモから「その時、本人が心の奥で感じていたはずの言葉」を紡ぎ出す詩人です。
    
    【入力】
    ・写真の画像データ
    ・ユーザーの短いメモ: 「${userText}」

    【あなたの任務】
    1. ユーザーのメモを素材に、200文字程度の日記を一人称で創作してください。写真の色彩や雰囲気から感情をエモく膨らませてください。
    2. 以下の【動物リスト】の中から、最も適した「animalId」を**必ず1つだけ**選択してください。

    【動物リスト（animalId）】
    - cat     （自由、気まぐれ、冒険心、自分らしくいたい時）
    - bear    （穏やか、包容力、安心感、ゆったりしている時）
    - fox     （好奇心旺盛、知恵、探求、何か新しい発見がある時）
    - mouse   （寂しい、不安、繊細、静かに寄り添ってほしい時）
    - dog     （親しみ、信頼、パートナーシップ、誰かと一緒にいたい時）
    - penguin （愛らしい、ムードメーカー、社交的、みんなを笑顔にしたい時）

    【出力ルール】
    ・必ず指定されたJSON形式で出力してください。
    ・animalId には英単語（cat, bear, fox, mouse, dog, penguin）のみを入れてください。
  `;

  const maxRetries = 2;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent([prompt, imagePart]);
      const response = result.response;
      return JSON.parse(response.text());
    } catch (error) {
      const status = (error as { status?: number })?.status;
      const shouldRetry = status === 503 && attempt < maxRetries;
      if (shouldRetry) {
        const waitMs = 700 * (attempt + 1);
        await new Promise((resolve) => setTimeout(resolve, waitMs));
        continue;
      }
      console.error("Gemini Analysis Error:", error);
      throw new Error("AI解析に失敗しました", { cause: error });
    }
  }
  throw new Error("AI解析に失敗しました");
}