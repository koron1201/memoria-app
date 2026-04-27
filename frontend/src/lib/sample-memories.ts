import type { AnimalId } from "@/lib/mood";

export interface SampleMemory {
  id: string;
  /** 例: 5/31(土) */
  date: string;
  animalId: AnimalId;
  preview: string;
  /** 一覧の見出し（短い行） */
  listTitle: string;
  /** タグ2つ（UIは横並び想定） */
  tags: [string, string];
  /** サムネ（remote 許可: images.unsplash.com） */
  imageUrl: string;
  /** 行末メタ。任意（例: 0:3） */
  meta?: string;
}

export const SAMPLE_MEMORIES: SampleMemory[] = [
  {
    id: "1",
    date: "5/31(土)",
    animalId: "free",
    listTitle: "カフェで読書とラテ",
    tags: ["集中", "落ち着き"],
    imageUrl:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&h=200&fit=crop&q=80",
    meta: "0:3",
    preview: "公園で出会った猫と過ごした午後。風が気持ちよかった。",
  },
  {
    id: "2",
    date: "5/30(金)",
    animalId: "calm",
    listTitle: "窓辺のコーヒーで本文を読む",
    tags: ["楽しい", "つながり"],
    imageUrl:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&h=200&fit=crop&q=80",
    meta: "0:1",
    preview: "本を読みながら、静かに一杯のコーヒー。窓越しの光が柔らかかった。",
  },
  {
    id: "3",
    date: "5/28(水)",
    animalId: "curious",
    listTitle: "路地裏カフェの初訪",
    tags: ["集中", "達成感"],
    imageUrl:
      "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=200&h=200&fit=crop&q=80",
    meta: "0:0",
    preview: "気になっていた路地裏のカフェを探検。新しい香りに出会った。",
  },
  {
    id: "4",
    date: "5/25(日)",
    animalId: "friendly",
    listTitle: "駅前の再会と帰り道",
    tags: ["ぬくもり", "つながり"],
    imageUrl:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200&h=200&fit=crop&q=80",
    meta: "0:2",
    preview: "駅前で偶然の再会。短い立ち話でも心があたたまった。",
  },
];
