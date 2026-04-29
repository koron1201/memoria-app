export type TanzakuStep = {
  title: string;
  detail: string;
  dueDate: string;
  done: boolean;
  completedAt: string | null;
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

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
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
