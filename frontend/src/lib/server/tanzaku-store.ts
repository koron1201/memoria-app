import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

import type { TanzakuStep, TanzakuWish } from "@/lib/api/tanzaku";

type TanzakuRecord = {
  id: string;
  dream: string;
  deadline: string | null;
  roadmap_steps: TanzakuStep[];
  status: "active" | "achieved";
  reflection: string | null;
  created_at: string;
  achieved_at: string | null;
};

const memoryStore = new Map<string, TanzakuRecord>();

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function toClient(record: TanzakuRecord): TanzakuWish {
  return {
    id: record.id,
    dream: record.dream,
    deadline: record.deadline,
    steps: record.roadmap_steps,
    status: record.status,
    reflection: record.reflection,
    createdAt: record.created_at,
    achievedAt: record.achieved_at,
  };
}

function toRecord(item: TanzakuWish): TanzakuRecord {
  return {
    id: item.id,
    dream: item.dream,
    deadline: item.deadline,
    roadmap_steps: item.steps,
    status: item.status,
    reflection: item.reflection,
    created_at: item.createdAt,
    achieved_at: item.achievedAt,
  };
}

function fallbackDate(deadline: string | null, index: number, total: number) {
  const end = deadline ? new Date(`${deadline}T12:00:00`) : new Date(Date.now() + 1000 * 60 * 60 * 24 * 180);
  if (Number.isNaN(end.getTime())) return "";
  const date = new Date(end);
  date.setDate(end.getDate() - (total - index - 1) * 14);
  return date.toISOString().slice(0, 10);
}

function fallbackSteps(dream: string, deadline: string | null): TanzakuStep[] {
  const titles = [
    "叶えたい理由を一文で残す",
    "今できていることを書き出す",
    "最初の小さな行動を始める",
    "週に一度の習慣にする",
    "途中経過を見える形にする",
    "誰かに見てもらい改善する",
    "達成した証を残す",
  ];

  return titles.map((title, index) => ({
    title,
    detail: `「${dream}」に近づくため、今日の行動に落とし込む。`,
    dueDate: fallbackDate(deadline, index, titles.length),
    done: false,
    completedAt: null,
  }));
}

function normalizeSteps(raw: unknown, dream: string, deadline: string | null): TanzakuStep[] {
  const steps = (raw as { steps?: Partial<TanzakuStep>[] })?.steps;
  if (!Array.isArray(steps)) return fallbackSteps(dream, deadline);
  const normalized = steps.slice(0, 10).map((step, index) => ({
    title: typeof step.title === "string" && step.title.trim() ? step.title.trim() : `ステップ${index + 1}`,
    detail: typeof step.detail === "string" && step.detail.trim() ? step.detail.trim() : "具体的な行動を一つ決めて進める。",
    dueDate:
      typeof step.dueDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(step.dueDate)
        ? step.dueDate
        : fallbackDate(deadline, index, steps.length),
    done: false,
    completedAt: null,
  }));
  return normalized.length >= 5 ? normalized : fallbackSteps(dream, deadline);
}

async function generateSteps(dream: string, deadline: string | null): Promise<TanzakuStep[]> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return fallbackSteps(dream, deadline);

  const prompt = `夢「${dream}」を達成するためのロードマップを5個以上10個以下で作成してください。最終期限は「${deadline ?? "未指定"}」。各ステップはtitle/detail/dueDate(YYYY-MM-DD)を持つJSONだけで返してください。`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      },
    );
    if (!res.ok) return fallbackSteps(dream, deadline);
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return normalizeSteps(JSON.parse(text), dream, deadline);
  } catch {
    return fallbackSteps(dream, deadline);
  }
}

export async function createTanzaku(input: { dream: string; deadline: string | null }) {
  const dream = input.dream.trim().slice(0, 40);
  if (!dream) throw new Error("夢を入力してください");
  const deadline = input.deadline && /^\d{4}-\d{2}-\d{2}$/.test(input.deadline) ? input.deadline : null;
  const now = new Date().toISOString();
  const record: TanzakuRecord = {
    id: randomUUID(),
    dream,
    deadline,
    roadmap_steps: await generateSteps(dream, deadline),
    status: "active",
    reflection: null,
    created_at: now,
    achieved_at: null,
  };

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    memoryStore.set(record.id, record);
    return toClient(record);
  }

  const { data, error } = await supabase.from("tanzaku_wishes").insert(record).select().single();
  if (error) {
    console.error("Next Tanzaku insert error:", error);
    memoryStore.set(record.id, record);
    return toClient(record);
  }
  return toClient(data as TanzakuRecord);
}

export async function listTanzaku(status?: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return [...memoryStore.values()]
      .filter((item) => (status === "active" || status === "achieved" ? item.status === status : true))
      .map(toClient);
  }

  let query = supabase.from("tanzaku_wishes").select("*").order("created_at", { ascending: false });
  if (status === "active" || status === "achieved") query = query.eq("status", status);
  const { data, error } = await query;
  if (error) {
    console.error("Next Tanzaku list error:", error);
    return [...memoryStore.values()].map(toClient);
  }
  return ((data ?? []) as TanzakuRecord[]).map(toClient);
}

export async function getTanzaku(id: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return memoryStore.has(id) ? toClient(memoryStore.get(id)!) : null;

  const { data, error } = await supabase.from("tanzaku_wishes").select("*").eq("id", id).single();
  if (error) return memoryStore.has(id) ? toClient(memoryStore.get(id)!) : null;
  return toClient(data as TanzakuRecord);
}

export async function updateTanzaku(id: string, input: Partial<Pick<TanzakuWish, "steps" | "reflection">>) {
  const current = await getTanzaku(id);
  if (!current) return null;

  const steps = Array.isArray(input.steps)
    ? current.steps.map((step, index) => {
        const patch = input.steps?.[index];
        const done = typeof patch?.done === "boolean" ? patch.done : step.done;
        return {
          ...step,
          done,
          completedAt: done ? step.completedAt ?? new Date().toISOString() : null,
        };
      })
    : current.steps;
  const allDone = steps.length > 0 && steps.every((step) => step.done);
  const next: TanzakuWish = {
    ...current,
    steps,
    status: allDone ? "achieved" : "active",
    reflection: typeof input.reflection === "string" ? input.reflection.trim().slice(0, 600) || null : current.reflection,
    achievedAt: allDone ? current.achievedAt ?? new Date().toISOString() : null,
  };

  const record = toRecord(next);
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    memoryStore.set(record.id, record);
    return next;
  }
  const { data, error } = await supabase
    .from("tanzaku_wishes")
    .update({
      roadmap_steps: record.roadmap_steps,
      status: record.status,
      reflection: record.reflection,
      achieved_at: record.achieved_at,
    })
    .eq("id", id)
    .select()
    .single();
  if (error) {
    memoryStore.set(record.id, record);
    return next;
  }
  return toClient(data as TanzakuRecord);
}
