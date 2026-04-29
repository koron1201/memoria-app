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

const roadmapSchema = {
  description: "夢を達成するためのロードマップ",
  type: SchemaType.OBJECT as const,
  properties: {
    steps: {
      type: SchemaType.ARRAY as const,
      description: "夢を達成するための具体的なステップ。5個以上10個以下。",
      minItems: 5,
      maxItems: 10,
      items: {
        type: SchemaType.OBJECT as const,
        properties: {
          title: {
            type: SchemaType.STRING as const,
            description: "ステップ名。短く具体的に。",
          },
          detail: {
            type: SchemaType.STRING as const,
            description: "そのステップで実行する内容。1文で具体的に。",
          },
          dueDate: {
            type: SchemaType.STRING as const,
            description: "YYYY-MM-DD形式の目安期限。",
          },
        },
        required: ["title", "detail", "dueDate"],
      },
    },
  },
  required: ["steps"],
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

export type GeneratedRoadmapStep = {
  title: string;
  detail: string;
  dueDate: string;
};

function clampRoadmapSteps(raw: unknown): GeneratedRoadmapStep[] {
  const parsed = raw as { steps?: Partial<GeneratedRoadmapStep>[] };
  const steps = Array.isArray(parsed.steps) ? parsed.steps : [];
  return steps
    .slice(0, 10)
    .map((step, index) => ({
      title:
        typeof step.title === "string" && step.title.trim()
          ? step.title.trim()
          : `ステップ${index + 1}`,
      detail:
        typeof step.detail === "string" && step.detail.trim()
          ? step.detail.trim()
          : "達成に向けた小さな行動を決めて実行する。",
      dueDate:
        typeof step.dueDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(step.dueDate)
          ? step.dueDate
          : "",
    }))
    .filter((step) => step.title)
    .slice(0, 10);
}

function fallbackSteps(dream: string, deadline?: string): GeneratedRoadmapStep[] {
  const baseDate = deadline && /^\d{4}-\d{2}-\d{2}$/.test(deadline)
    ? new Date(`${deadline}T12:00:00`)
    : new Date(Date.now() + 1000 * 60 * 60 * 24 * 180);
  const titles = [
    "叶えたい理由を言葉にする",
    "今の状態を整理する",
    "最初の一歩を決める",
    "週ごとの行動に分ける",
    "成果を誰かに見てもらう",
    "振り返って改善する",
    "達成の形を残す",
  ];

  return titles.map((title, index) => {
    const due = new Date(baseDate);
    due.setDate(baseDate.getDate() - (titles.length - index - 1) * 14);
    return {
      title,
      detail: `「${dream}」に近づくため、無理なく続けられる形に具体化する。`,
      dueDate: due.toISOString().slice(0, 10),
    };
  });
}

export async function generateDreamRoadmap(dream: string, deadline?: string) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: roadmapSchema,
    },
  });

  const prompt = `
    あなたは夢を現実的な行動計画に分解するコーチです。

    【夢】
    ${dream}

    【最終期限】
    ${deadline || "未指定"}

    【出力ルール】
    ・5個以上10個以下のステップを作ってください。
    ・各ステップは、ユーザーが実行できる具体的な行動にしてください。
    ・期限がある場合は、最終期限までに自然に進む日付をYYYY-MM-DDで割り当ててください。
    ・期限がない場合も、現実的な目安日をYYYY-MM-DDで割り当ててください。
    ・必ず指定されたJSON形式で出力してください。
  `;

  try {
    const result = await model.generateContent(prompt);
    const steps = clampRoadmapSteps(JSON.parse(result.response.text()));
    return steps.length >= 5 ? steps : fallbackSteps(dream, deadline);
  } catch (error) {
    console.error("Gemini Roadmap Error:", error);
    return fallbackSteps(dream, deadline);
  }
}
