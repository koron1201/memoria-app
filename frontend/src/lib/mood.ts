export type MoodId =
  | "free"
  | "calm"
  | "curious"
  | "lonely"
  | "friendly"
  | "social";

export interface MoodDef {
  id: MoodId;
  label: string;
  emoji: string;
  tagline: string;
  description: string;
  glb: string;
  accent: string;
}

export const MOODS: MoodDef[] = [
  {
    id: "free",
    label: "自由っぽい",
    emoji: "🐱",
    tagline: "気まぐれに世界を歩く",
    description:
      "気まぐれに、でも確かに自分のリズムで歩く。立ち止まっても進み始めても、世界はあなたのペースで待っている。",
    glb: "/models/animals/cat.glb",
    accent: "#9BB5A5",
  },
  {
    id: "calm",
    label: "穏やか",
    emoji: "🐻",
    tagline: "どっしり構えた安心感",
    description:
      "大きな背中に、今日の喧騒を預けていい。変わらないものが、ここにはまだ残っている。",
    glb: "/models/animals/bear.glb",
    accent: "#6B8F7A",
  },
  {
    id: "curious",
    label: "好奇心旺盛",
    emoji: "🦊",
    tagline: "知りたがりの探究者",
    description:
      "小さな違和感も見逃さないまなざし。歩幅は軽く、視線は遠く。次の角には、まだ見ぬ物語。",
    glb: "/models/animals/fox.glb",
    accent: "#C9A87C",
  },
  {
    id: "lonely",
    label: "寂しい・不安",
    emoji: "🐭",
    tagline: "そっと寄り添う、繊細な心",
    description:
      "届かない声も、震える手も、夜の静けさはそっと受けとめる。小さな灯りのそばで、ゆっくり息を整えて。",
    glb: "/models/animals/rat.glb",
    accent: "#C4B59A",
  },
  {
    id: "friendly",
    label: "親しみ",
    emoji: "🐶",
    tagline: "いつも隣にいる安心",
    description:
      "駆け寄る足音と、ただいまの笑顔。隣にいる、それだけで今日は十分に満ちていく。",
    glb: "/models/animals/dog.glb",
    accent: "#D4847A",
  },
  {
    id: "social",
    label: "愛らしい",
    emoji: "🐧",
    tagline: "みんなと過ごす幸せ",
    description:
      "揃った歩幅、連なる背中。ひとりでは得られないあたたかさを、群れの中で見つける。",
    glb: "/models/animals/penguin.glb",
    accent: "#7A9B8A",
  },
];

export const DEFAULT_MOOD_ID: MoodId = "free";

export function getMood(id: MoodId): MoodDef {
  return MOODS.find((m) => m.id === id) ?? MOODS[0];
}

// Animal ドメインとして再エクスポート（Memory.animalId から参照する用途）
export type AnimalId = MoodId;
export type Animal = MoodDef;
export const ANIMALS = MOODS;
export const DEFAULT_ANIMAL_ID: AnimalId = DEFAULT_MOOD_ID;
export const getAnimal = getMood;
