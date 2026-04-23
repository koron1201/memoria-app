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
  // 高速で安価な 1.5 Flash モデルを使用
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
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
    あなたは、ユーザーの「思い出」からその人の「心の状態（MBTI的側面）」を読み解き、動物に例える専門家です。
    ユーザーの投稿した写真の雰囲気と、メッセージ「${userText}」を深く分析し、以下の基準で最も近い動物（animalId）を決定してください。

    【動物判定のアルゴリズム（MBTIリファレンス）】
    - lion: 外向的(E)、活発、情熱的。主役として場を楽しんでいる。
    - rabbit: 内向的(I)、繊細、思慮深い。静かな感動や、一人の時間を大切にしている。
    - cat: 自由、直感的(N)、マイペース。枠にとらわれず、その瞬間の感性を楽しんでいる。
    - bear: 穏やか、現実的(S)、安定感。日常の幸せや、確かな繋がりを感じている。
    - fox: 好奇心、論理的(T)または探索的(P)。新しい発見や、知的な刺激を楽しんでいる。

    分析結果に基づき、指定されたJSON形式で出力してください。
    特に 'diaryText' は、単なる事実の羅列ではなく、その動物の性格が表れているような、本人も気づいていない感情を言語化するエモい文章にしてください。
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