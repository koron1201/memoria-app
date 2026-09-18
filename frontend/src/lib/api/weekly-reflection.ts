import { supabase } from "@/lib/supabase";

export type WeeklyReflection = {
  weekStart: string;
  weekEnd: string;
  memoryCount: number;
  topEmotion: string | null;
  comment: string;
  isFirstWeek: boolean;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init);
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? "週間コメントを取得できませんでした。");
  }
  return response.json() as Promise<T>;
}

export const weeklyReflectionApi = {
  current() {
    return supabase.auth.getSession().then(({ data: { session } }) =>
      request<{ item: WeeklyReflection | null }>("/api/weekly-reflection", {
        headers: session ? { Authorization: `Bearer ${session.access_token}` } : undefined,
      }),
    );
  },
};
import { supabase } from "@/lib/supabase";
