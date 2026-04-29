import type { AnimalId } from "@/lib/mood";
import { DEFAULT_ANIMAL_ID } from "@/lib/mood";
import type { SampleMemory } from "@/lib/sample-memories";

export type MemoryAnimalId = "lion" | "rabbit" | "cat" | "bear" | "fox";

export interface MemoryRecord {
  id: number;
  image_url: string;
  diary_text: string;
  emotion: string;
  animal_id: string;
  created_at: string;
}

export interface MemoryAlbumItem {
  id: number;
  imageUrl: string;
  diaryText: string;
  emotion: string;
  animalId: MemoryAnimalId;
  createdAt: string;
}

export const MEMORY_ANIMAL_MAP: Record<string, AnimalId> = {
  lion: "friendly",
  rabbit: "calm",
  cat: "free",
  bear: "calm",
  fox: "curious",
};

const MEMORY_EMOTION_LABEL: Record<AnimalId, string> = {
  free: "喜び",
  calm: "落ち着き",
  curious: "探究",
  lonely: "そっと",
  friendly: "つながり",
  social: "ふれあい",
};

export function formatMemoryListDate(createdAt: string) {
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return "";
  const week = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()];
  return `${d.getMonth() + 1}/${d.getDate()}(${week})`;
}

export function toHomeMemory(row: MemoryRecord): SampleMemory {
  const animalId = MEMORY_ANIMAL_MAP[row.animal_id] ?? DEFAULT_ANIMAL_ID;
  const diaryText = row.diary_text.trim();

  return {
    id: String(row.id),
    date: formatMemoryListDate(row.created_at),
    animalId,
    preview: diaryText,
    listTitle: diaryText.length > 18 ? `${diaryText.slice(0, 18)}...` : diaryText,
    tags: [row.emotion, MEMORY_EMOTION_LABEL[animalId]],
    imageUrl: row.image_url,
    meta: "",
  };
}

export function toAlbumMemory(row: MemoryRecord): MemoryAlbumItem {
  const animalId = ["lion", "rabbit", "cat", "bear", "fox"].includes(row.animal_id)
    ? (row.animal_id as MemoryAnimalId)
    : "cat";

  return {
    id: row.id,
    imageUrl: row.image_url,
    diaryText: row.diary_text,
    emotion: row.emotion,
    animalId,
    createdAt: row.created_at,
  };
}
