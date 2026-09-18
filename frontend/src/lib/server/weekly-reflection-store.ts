import { createClient } from "@supabase/supabase-js";

import type { WeeklyReflection } from "@/lib/api/weekly-reflection";

type MemoryRow = {
  created_at: string;
  diary_text: string;
  emotion: string | null;
};

type ReflectionRow = {
  user_id: string;
  week_start: string;
  week_end: string;
  memory_count: number;
  top_emotion: string | null;
  comment: string;
  is_first_week: boolean;
};

const FIRST_WEEK_COMMENT =
  "いよいよMEMORIAでの記録が始まりました。小さな出来事や気持ちも、これから少しずつ残していきましょう。";

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? createClient(url, key) : null;
}

function dateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return { year: Number(value("year")), month: Number(value("month")), day: Number(value("day")) };
}

function weekRange(date = new Date()) {
  const { year, month, day } = dateParts(date);
  const local = new Date(Date.UTC(year, month - 1, day));
  const offsetToMonday = (local.getUTCDay() + 6) % 7;
  local.setUTCDate(local.getUTCDate() - offsetToMonday);
  const start = local.toISOString().slice(0, 10);
  local.setUTCDate(local.getUTCDate() + 6);
  return { start, end: local.toISOString().slice(0, 10) };
}

function toClient(row: ReflectionRow): WeeklyReflection {
  return {
    weekStart: row.week_start,
    weekEnd: row.week_end,
    memoryCount: row.memory_count,
    topEmotion: row.top_emotion,
    comment: row.comment,
    isFirstWeek: row.is_first_week,
  };
}

function mostFrequentEmotion(memories: MemoryRow[]) {
  const counts = new Map<string, number>();
  for (const memory of memories) {
    const emotion = memory.emotion?.trim();
    if (emotion) counts.set(emotion, (counts.get(emotion) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ja"))[0]?.[0] ?? null;
}

function fallbackComment(memoryCount: number, topEmotion: string | null) {
  const emotion = topEmotion ? `「${topEmotion}」の気持ち` : "いろいろな気持ち";
  return `今週は${memoryCount}件の思い出を残せました。${emotion}が心に残る一週間でした。来週も、心が少し動いた瞬間をひとつだけ残してみましょう。`;
}

async function generateComment(memories: MemoryRow[], topEmotion: string | null) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return fallbackComment(memories.length, topEmotion);

  const diaries = memories.slice(0, 20).map((memory, index) => ({
    number: index + 1,
    emotion: memory.emotion ?? "",
    text: memory.diary_text.slice(0, 300),
  }));
  const prompt = `あなたはMEMORIAのやさしい週次ふりかえり編集者です。次の記録だけを根拠に、120〜180字の日本語で週間コメントを作成してください。必ず、記録件数、多かった感情、印象的な出来事の要約、来週への一言を含めてください。日記にない事実を作らず、心理診断・医療助言・断定はしないでください。見出しや箇条書きは不要です。\n\n記録件数: ${memories.length}\n最も多かった感情: ${topEmotion ?? "不明"}\n記録: ${JSON.stringify(diaries)}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      },
    );
    if (!response.ok) return fallbackComment(memories.length, topEmotion);
    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return typeof text === "string" && text.trim() ? text.trim().slice(0, 400) : fallbackComment(memories.length, topEmotion);
  } catch {
    return fallbackComment(memories.length, topEmotion);
  }
}

export async function getCurrentWeeklyReflection(accessToken: string | null): Promise<WeeklyReflection | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase || !accessToken) return null;

  const { data: authData, error: authError } = await supabase.auth.getUser(accessToken);
  if (authError || !authData.user) return null;
  const userId = authData.user.id;

  const { start, end } = weekRange();
  // Sunday + 1 day at 00:00 in Japan is Sunday 15:00 UTC.
  const weekEndExclusive = new Date(`${end}T15:00:00.000Z`);
  const { data: memories, error: memoriesError } = await supabase
    .from("memories")
    .select("created_at, diary_text, emotion")
    .eq("user_id", userId)
    .gte("created_at", `${start}T00:00:00+09:00`)
    .lt("created_at", weekEndExclusive.toISOString())
    .order("created_at", { ascending: true });

  if (memoriesError) throw new Error("今週の思い出を取得できませんでした。");
  const currentMemories = (memories ?? []) as MemoryRow[];
  if (currentMemories.length === 0) return null;

  const { data: firstMemory } = await supabase
    .from("memories")
    .select("created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  const isFirstWeek = Boolean(firstMemory && weekRange(new Date(firstMemory.created_at)).start === start);
  const topEmotion = mostFrequentEmotion(currentMemories);

  const { data: existing } = await supabase
    .from("weekly_reflections")
    .select("user_id, week_start, week_end, memory_count, top_emotion, comment, is_first_week")
    .eq("user_id", userId)
    .eq("week_start", start)
    .maybeSingle();
  if (existing && (existing as ReflectionRow).memory_count === currentMemories.length) return toClient(existing as ReflectionRow);

  const row: ReflectionRow = {
    user_id: userId,
    week_start: start,
    week_end: end,
    memory_count: currentMemories.length,
    top_emotion: topEmotion,
    comment: isFirstWeek ? FIRST_WEEK_COMMENT : await generateComment(currentMemories, topEmotion),
    is_first_week: isFirstWeek,
  };
  const { data: saved, error: saveError } = await supabase
    .from("weekly_reflections")
    .upsert(row, { onConflict: "user_id,week_start" })
    .select("user_id, week_start, week_end, memory_count, top_emotion, comment, is_first_week")
    .single();
  if (saveError) throw new Error("週間コメントを保存できませんでした。");
  return toClient(saved as ReflectionRow);
}
