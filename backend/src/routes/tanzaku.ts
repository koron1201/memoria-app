import { todayInJapan, validateDeadline } from "../lib/tanzaku-dates";
import { Hono } from "hono";
import { randomUUID } from "node:crypto";
import { generateDreamRoadmap, type GeneratedRoadmapStep } from "../services/gemini";
import { getAuthUser, supabase } from "../lib/supabase";

const router = new Hono();

type TanzakuStep = GeneratedRoadmapStep & {
  done: boolean;
  completedAt: string | null;
};

type TanzakuRecord = {
  id: string;
  dream: string;
  deadline: string | null;
  roadmap_steps: TanzakuStep[];
  status: "active" | "achieved";
  reflection: string | null;
  created_at: string;
  achieved_at: string | null;
  user_id: string;
};

const memoryStore = new Map<string, TanzakuRecord>();

function isMissingSupabaseConfig() {
  return !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY;
}

function toClientRecord(record: TanzakuRecord) {
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

function normalizeSteps(steps: GeneratedRoadmapStep[]): TanzakuStep[] {
  return steps.slice(0, 10).map((step) => ({
    title: step.title,
    detail: step.detail,
    dueDate: step.dueDate,
    generationSource: step.generationSource,
    done: false,
    completedAt: null,
  }));
}

async function insertRecord(record: TanzakuRecord) {
  if (isMissingSupabaseConfig()) {
    memoryStore.set(record.id, record);
    return record;
  }

  const { data, error } = await supabase
    .from("tanzaku_wishes")
    .insert(record)
    .select()
    .single();

  if (error) {
    console.error("Tanzaku insert error:", error);
    memoryStore.set(record.id, record);
    return record;
  }

  return data as TanzakuRecord;
}

async function listRecords(userId: string, status?: string) {
  if (isMissingSupabaseConfig()) {
    return [...memoryStore.values()].filter((record) =>
      record.user_id === userId && (status === "active" || status === "achieved" ? record.status === status : true),
    );
  }

  let query = supabase
    .from("tanzaku_wishes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (status === "active" || status === "achieved") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Tanzaku list error:", error);
    return [...memoryStore.values()].filter((record) => record.user_id === userId);
  }
  return (data ?? []) as TanzakuRecord[];
}

async function getRecord(id: string, userId: string) {
  if (isMissingSupabaseConfig()) {
    const record = memoryStore.get(id);
    return record?.user_id === userId ? record : null;
  }

  const { data, error } = await supabase
    .from("tanzaku_wishes")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Tanzaku get error:", error);
    const record = memoryStore.get(id);
    return record?.user_id === userId ? record : null;
  }
  return data as TanzakuRecord;
}

async function updateRecord(record: TanzakuRecord) {
  if (isMissingSupabaseConfig()) {
    memoryStore.set(record.id, record);
    return record;
  }

  const { data, error } = await supabase
    .from("tanzaku_wishes")
    .update({
      roadmap_steps: record.roadmap_steps,
      status: record.status,
      reflection: record.reflection,
      achieved_at: record.achieved_at,
    })
    .eq("id", record.id)
    .eq("user_id", record.user_id)
    .select()
    .single();

  if (error) {
    console.error("Tanzaku update error:", error);
    memoryStore.set(record.id, record);
    return record;
  }
  return data as TanzakuRecord;
}

router.post("/", async (c) => {
  let userId: string;
  try { userId = (await getAuthUser(c.req.header("Authorization") ?? null)).id; } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "ログインが必要です" }, 401);
  }
  const body = await c.req.json().catch(() => ({}));
  const dream = typeof body?.dream === "string" ? body.dream.trim().slice(0, 40) : "";
  if (!dream) return c.json({ error: "夢を入力してください" }, 400);
  const startedAt = new Date();
  const today = todayInJapan(startedAt);
  let deadline: string | null;
  try {
    deadline = validateDeadline(body?.deadline, today);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
  const generatedSteps = await generateDreamRoadmap(dream, deadline ?? undefined, today);
  const now = startedAt.toISOString();
  const record: TanzakuRecord = {
    id: randomUUID(),
    dream,
    deadline,
    roadmap_steps: normalizeSteps(generatedSteps),
    status: "active",
    reflection: null,
    created_at: now,
    achieved_at: null,
    user_id: userId,
  };

  const saved = await insertRecord(record);
  return c.json(toClientRecord(saved), 201);
});

router.get("/", async (c) => {
  let userId: string;
  try { userId = (await getAuthUser(c.req.header("Authorization") ?? null)).id; } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "ログインが必要です" }, 401);
  }
  const status = c.req.query("status");
  const records = await listRecords(userId, status);
  return c.json({ items: records.map(toClientRecord) });
});

router.get("/:id", async (c) => {
  let userId: string;
  try { userId = (await getAuthUser(c.req.header("Authorization") ?? null)).id; } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "ログインが必要です" }, 401);
  }
  const record = await getRecord(c.req.param("id"), userId);
  if (!record) return c.json({ error: "短冊が見つかりません" }, 404);
  return c.json(toClientRecord(record));
});

router.patch("/:id", async (c) => {
  let userId: string;
  try { userId = (await getAuthUser(c.req.header("Authorization") ?? null)).id; } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "ログインが必要です" }, 401);
  }
  const record = await getRecord(c.req.param("id"), userId);
  if (!record) return c.json({ error: "短冊が見つかりません" }, 404);

  const body = await c.req.json().catch(() => ({}));
  const nextSteps = Array.isArray(body.steps)
    ? record.roadmap_steps.map((step, index) => {
        const patch = body.steps[index] as Partial<TanzakuStep> | undefined;
        const done = typeof patch?.done === "boolean" ? patch.done : step.done;
        return {
          ...step,
          done,
          completedAt:
            done && !step.completedAt
              ? new Date().toISOString()
              : done
                ? step.completedAt
                : null,
        };
      })
    : record.roadmap_steps;

  const allDone = nextSteps.length > 0 && nextSteps.every((step) => step.done);
  const reflection =
    typeof body.reflection === "string" ? body.reflection.trim().slice(0, 600) : record.reflection;

  const updated: TanzakuRecord = {
    ...record,
    roadmap_steps: nextSteps,
    status: allDone ? "achieved" : "active",
    reflection: reflection || null,
    achieved_at: allDone ? record.achieved_at ?? new Date().toISOString() : null,
  };

  const saved = await updateRecord(updated);
  return c.json(toClientRecord(saved));
});

export default router;
