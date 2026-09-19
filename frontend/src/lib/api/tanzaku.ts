import { supabase } from "@/lib/supabase";

export type TanzakuStep = {
  title: string;
  detail: string;
  dueDate: string;
  done: boolean;
  completedAt: string | null;
  generationSource?: "ai" | "fallback";
};

export type TanzakuWish = {
  id: string;
  dream: string;
  deadline: string | null;
  steps: TanzakuStep[];
  status: "active" | "achieved";
  reflection: string | null;
  createdAt: string;
  achievedAt: string | null;
};

function apiUrl(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(apiUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? "短冊APIでエラーが発生しました");
  }

  return res.json() as Promise<T>;
}

export const tanzakuApi = {
  create(input: { dream: string; deadline: string | null }) {
    return request<TanzakuWish>("/api/tanzaku", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  list(status?: "active" | "achieved") {
    const query = status ? `?status=${status}` : "";
    return request<{ items: TanzakuWish[] }>(`/api/tanzaku${query}`);
  },

  get(id: string) {
    return request<TanzakuWish>(`/api/tanzaku/${id}`);
  },

  update(
    id: string,
    input: Partial<Pick<TanzakuWish, "steps" | "reflection">>,
  ) {
    return request<TanzakuWish>(`/api/tanzaku/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },
};
