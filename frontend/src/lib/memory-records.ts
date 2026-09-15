import type { AnimalId } from "@/lib/mood";
import { DEFAULT_ANIMAL_ID } from "@/lib/mood";
import type { SampleMemory } from "@/lib/sample-memories";

/**
 * Geminiが返し、データベースに保存する動物ID
 */
export type MemoryAnimalId =
  | "cat"
  | "bear"
  | "fox"
  | "mouse"
  | "dog"
  | "penguin";

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

/**
 * Gemini・DBの動物IDと、画面表示用のAnimalIdとの対応
 */
export const MEMORY_ANIMAL_MAP: Record<MemoryAnimalId, AnimalId> = {
  cat: "free",
  bear: "calm",
  fox: "curious",
  mouse: "lonely",
  dog: "friendly",
  penguin: "social",
};

const MEMORY_ANIMAL_IDS: MemoryAnimalId[] = [
  "cat",
  "bear",
  "fox",
  "mouse",
  "dog",
  "penguin",
];

const MEMORY_EMOTION_LABEL: Record<AnimalId, string> = {
  free: "喜び",
  calm: "落ち着き",
  curious: "探究",
  lonely: "そっと",
  friendly: "つながり",
  social: "ふれあい",
};

/**
 * 文字列が有効な動物IDか判定する
 */
function isMemoryAnimalId(value: string): value is MemoryAnimalId {
  return MEMORY_ANIMAL_IDS.includes(value as MemoryAnimalId);
}

/**
 * 日付を「月/日（曜日）」形式へ変換する
 */
export function formatMemoryListDate(createdAt: string): string {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const week = ["日", "月", "火", "水", "木", "金", "土"];
  const dayOfWeek = week[date.getDay()];

  return `${date.getMonth() + 1}/${date.getDate()}(${dayOfWeek})`;
}

/**
 * データベースのMemoryをホーム画面用に変換する
 */
export function toHomeMemory(row: MemoryRecord): SampleMemory {
  const animalId = isMemoryAnimalId(row.animal_id)
    ? MEMORY_ANIMAL_MAP[row.animal_id]
    : DEFAULT_ANIMAL_ID;

  const diaryText = row.diary_text.trim();

  return {
    id: String(row.id),
    date: formatMemoryListDate(row.created_at),
    animalId,
    preview: diaryText,
    listTitle:
      diaryText.length > 18
        ? `${diaryText.slice(0, 18)}...`
        : diaryText,
    tags: [row.emotion, MEMORY_EMOTION_LABEL[animalId]],
    imageUrl: row.image_url,
    meta: "",
  };
}

/**
 * データベースのMemoryをアルバム画面用に変換する
 */
export function toAlbumMemory(row: MemoryRecord): MemoryAlbumItem {
  const animalId: MemoryAnimalId = isMemoryAnimalId(row.animal_id)
    ? row.animal_id
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