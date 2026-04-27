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
    あなたは、写真と短いメモから「その時、本人が心の奥で感じていたはずの言葉」を紡ぎ出す詩人です。
    
    【入力】
    ・写真の画像データ
    ・ユーザーの短いメモ: 「${userText}」

    【あなたの任務】
    1. ユーザーのメモを素材に、200文字程度の【全く新しい日記】を一人称で創作してください。メモをそのまま出力せず、写真の色彩や雰囲気から読み取った感情をエモく膨らませてください。
    2. 入力内容の雰囲気から、以下の【動物リスト】の中から、最も適した「animalId」を**必ず1つだけ**選択してください。

    【動物リスト（animalIdとして使用する英単語）】
    - lion    （情熱的、誇り、リーダーシップを感じる時）
    - rabbit  （思慮深い、穏やか、繊細、静かな時間を過ごしている時）
    - cat     （気まぐれ、自由、冒険心、自分らしくいたい時）
    - bear    （穏やか、包容力、ゆったりとした安心感がある時）
    - fox     （好奇心旺盛、知恵、何か新しいものを探求している時）

    【出力ルール】
    ・必ず指定されたJSON形式で出力してください。
    ・animalId フィールドには、上記のリストにある **lion, rabbit, cat, bear, fox のいずれか1つ**を、引用符なしの英単語のみで入れてください。
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