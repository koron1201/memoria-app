"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Bell,
  BookOpen,
  Camera,
  ChevronRight,
  Eraser,
  LinkIcon,
  Lock,
  LogOut,
  Mail,
  PawPrint,
  Pencil,
  Shield,
  Sparkles,
  Star,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { MoodAnimal } from "@/components/mood-animal";
import {
  DottedDivider,
  NotebookHeader,
  NotebookSectionTitle,
  NotebookSheet,
  NotebookSideTabs,
  WashiTape,
} from "@/components/notebook-shell";
import { Toggle } from "@/components/profile/toggle";
import { DEFAULT_ROADMAP_HREF } from "@/lib/app-paths";
import { fileToAvatarDataUrl } from "@/lib/avatar-image";
import { useProfile } from "@/lib/hooks/use-profile";
import { ANIMALS, getAnimal, type AnimalId } from "@/lib/mood";
import { MEMORY_ANIMAL_MAP, type MemoryAnimalId } from "@/lib/memory-records";
import { transitions } from "@/lib/motion";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const EMOTION_SUMMARY_DAYS = 30;
// Supabaseのmemoriesテーブルから取得する、感情集計に必要な列の型。
type EmotionSummaryRow = {
  id: number;
  animal_id: string;
  emotion: string | null;
  created_at: string;
};

type EmotionSummaryItem = {
  animalId: AnimalId;
  label: string;
  emoji: string;
  accent: string;
  count: number;
  percent: number;
  latestMemoryId: number | null;
  topEmotion: string;
};

const MEMORY_ANIMAL_IDS = Object.keys(MEMORY_ANIMAL_MAP) as MemoryAnimalId[];

// DBから受け取った文字列が、アプリで扱える動物IDかを判定する型ガード。
function isMemoryAnimalId(value: string): value is MemoryAnimalId {
  return MEMORY_ANIMAL_IDS.includes(value as MemoryAnimalId);
}

function buildEmotionSummary(rows: EmotionSummaryRow[]): EmotionSummaryItem[] {
  // 未知のanimal_idが入っていた場合は集計対象から除外する。
  const validRows = rows.filter((row) => isMemoryAnimalId(row.animal_id));
  // 動物ごとに件数・最新の日記・感情別件数を一時的にまとめる。
  const grouped = new Map<
    AnimalId,
    {
      count: number;
      latestMemoryId: number | null;
      latestCreatedAt: number;
      emotionCounts: Map<string, number>;
    }
  >();

  for (const row of validRows) {
    // memories側の動物IDを、画面表示で使うAnimalIdへ変換する。
    const animalId = MEMORY_ANIMAL_MAP[row.animal_id as MemoryAnimalId];
    const createdAt = new Date(row.created_at).getTime();
    const current = grouped.get(animalId) ?? {
      count: 0,
      latestMemoryId: null,
      latestCreatedAt: Number.NEGATIVE_INFINITY,
      emotionCounts: new Map<string, number>(),
    };

    current.count += 1;
    // この動物に該当する最新の日記IDを保持し、カード画面へのリンクに使う。
    if (!Number.isNaN(createdAt) && createdAt > current.latestCreatedAt) {
      current.latestCreatedAt = createdAt;
      current.latestMemoryId = row.id;
    }

    const emotion = row.emotion?.trim();

    // 空文字は数えず、同じ感情名が何回登場したかを記録する。
    if (emotion) {
      current.emotionCounts.set(emotion, (current.emotionCounts.get(emotion) ?? 0) + 1);
    }

    grouped.set(animalId, current);
  }

  // すべての動物を表示対象にし、未登場の動物も0件として返す。
  return ANIMALS.map((animal) => {
    const entry = grouped.get(animal.id);
    const topEmotion =
      entry && entry.emotionCounts.size > 0
        ? Array.from(entry.emotionCounts.entries()).sort((a, b) => b[1] - a[1])[0][0]
        : animal.label;

    return {
      animalId: animal.id,
      label: animal.label,
      emoji: animal.emoji,
      accent: animal.accent,
      count: entry?.count ?? 0,
      percent:
        validRows.length > 0
          ? Math.round(((entry?.count ?? 0) / validRows.length) * 100)
          : 0,
      latestMemoryId: entry?.latestMemoryId ?? null,
      topEmotion,
    };
  }).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "ja"));// 件数の多い順
}

// メールアドレスの先頭1文字だけを残してマスク表示する。
function maskEmail(email: string | null): string {
  if (!email) return "未連携";
  const [local, domain] = email.split("@");
  if (!domain) return "未連携";
  const head = local.slice(0, 1);
  const masked = "•".repeat(Math.min(6, Math.max(local.length - 1, 1)));
  return `${head}${masked}@${domain}`;
}

export default function ProfilePage() {
  const router = useRouter();
  const {
    profile,
    notifications,
    updateProfile,
    updateNotifications,
    clearLocal,
    logOut,
  } = useProfile();
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [emotionRows, setEmotionRows] = useState<EmotionSummaryRow[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(true);

  // emotionRowsが変化したときだけ再集計し、不要な計算を避ける。
  const emotionSummary = useMemo(() => buildEmotionSummary(emotionRows), [emotionRows]);
  const totalSummarizedMemories = useMemo(
    () => emotionSummary.reduce((sum, item) => sum + item.count, 0),
    [emotionSummary],
  );
  const dominantEmotion = emotionSummary.find((item) => item.count > 0) ?? null;
  // 最も多い感情に対応する動物を「今日の相棒」として表示する。
  const partner = getAnimal(dominantEmotion?.animalId ?? "free");

  useEffect(() => {
    // 画面遷移後に非同期処理が完了してもstateを更新しないためのフラグ。
    let cancelled = false;

    async function fetchEmotionSummary() {
      const since = new Date();
      since.setDate(since.getDate() - EMOTION_SUMMARY_DAYS);

      try {
        // 直近30日分の日記だけを、新しい順でSupabaseから取得する。
        const { data, error } = await supabase
          .from("memories")
          .select("id, animal_id, emotion, created_at")
          .gte("created_at", since.toISOString())
          .order("created_at", { ascending: false });

        if (cancelled) return;
        // 集計取得に失敗してもページ全体は止めず、0件として表示する。
        if (error || !data) {
          setEmotionRows([]);
        } else {
          setEmotionRows(data as EmotionSummaryRow[]);
        }
      } catch {
        if (!cancelled) setEmotionRows([]);
      } finally {
        if (!cancelled) setLoadingSummary(false);
      }
    }

    fetchEmotionSummary();

    return () => {
      // コンポーネントが破棄された後のstate更新を防ぐ。
      cancelled = true;
    };
  }, []);

  const containerVariants = {
    initial: {},
    animate: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: transitions.gentle },
  };

  function startEdit() {
    setDraftName(profile.displayName);
    setEditing(true);
  }

  async function saveEdit() {
    const trimmed = draftName.trim();
    if (trimmed) {
      await updateProfile({ displayName: trimmed });
    }
    setEditing(false);
  }

  async function onAvatarFile(file: File) {
    try {
      const avatarUrl = await fileToAvatarDataUrl(file);
      await updateProfile({ avatarUrl });
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "画像の取り込みに失敗しました");
    }
  }

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/auth/callback?next=/profile`
            : "/auth/callback?next=/profile",
      },
    });
  }

  return (
    <motion.main
      className="relative min-h-[calc(100vh-var(--nav-height))]"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <NotebookSheet maxWidth="max-w-[58rem]">
        <NotebookSideTabs active="profile" />
        <NotebookHeader title="MEMORIA" />

        <motion.div
          variants={itemVariants}
          className="mt-6 grid gap-7 md:grid-cols-[12rem_1fr] md:items-center"
        >
          <ProfilePhoto src={profile.avatarUrl} onFileSelect={onAvatarFile} />

          <div className="min-w-0">
            <div className="flex min-w-0 items-start gap-3">
              <h1 className="min-w-0 flex-1 break-words font-serif text-[2.35rem] font-bold leading-tight text-mono-ink sm:text-[2.75rem]">
                {profile.displayName}
              </h1>
              <button
                type="button"
                onClick={startEdit}
                className="mt-3 inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-white/55 text-primary ring-1 ring-mono-sage/15 transition hover:bg-white/80"
                aria-label="名前を編集する"
              >
                <Pencil className="size-4" aria-hidden />
              </button>
            </div>
            <DottedDivider className="mt-2 max-w-[20rem]" />
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="grid size-[3.75rem] place-items-center rounded-full border border-[#db7f92]/55 bg-white/30 text-center font-serif text-[0.65rem] leading-none text-[#c66b7f] rotate-[-8deg]">
                memoria
                <br />
                member
              </span>
              <span className="text-sm tracking-[0.12em] text-muted-foreground">
                since 2026・かきかえ自由
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Sticker tone="rose">喜び</Sticker>
              <Sticker tone="sun">楽しい</Sticker>
              <Sticker tone="sage">充実感</Sticker>
            </div>
          </div>
        </motion.div>

        {editing && (
          <motion.div
            variants={itemVariants}
            className="mt-6 rounded-[1rem] border border-mono-sage/18 bg-white/60 p-4 shadow-ambient backdrop-blur-sm"
          >
            <label className="block text-[12px] font-medium text-muted-foreground">
              プロフ帳に書く名前
            </label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                autoFocus
                maxLength={24}
                placeholder="表示名を入力"
                className="min-h-10 flex-1 rounded-xl border border-mono-sage/20 bg-mono-paper/70 px-3 text-sm outline-none transition focus:border-primary/55 focus:ring-2 focus:ring-primary/15"
              />
              <button
                type="button"
                onClick={saveEdit}
                className="h-10 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-soft"
              >
                保存
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="h-10 rounded-xl bg-white/65 px-5 text-sm font-medium text-muted-foreground ring-1 ring-mono-ink/8"
              >
                戻す
              </button>
            </div>
          </motion.div>
        )}

        <motion.section variants={itemVariants} className="mt-8">
          <NotebookSectionTitle title="今日の相棒" icon={Sparkles} />
          <div className="grid gap-5 rounded-[1rem] border border-mono-linen/35 bg-white/45 p-5 shadow-soft ring-1 ring-white/45 md:grid-cols-[1fr_14rem] md:items-center">
            <div>
              <h2 className="font-serif text-3xl font-semibold text-mono-ink">
                {partner.label}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {loadingSummary
                  ? "思い出から相棒を探しています"
                  : dominantEmotion
                    ? partner.tagline
                    : "日記を書くと、今のあなたに近い相棒が見えてきます"}
              </p>
              <Link
                href={dominantEmotion?.latestMemoryId ? `/animal-card/${dominantEmotion.latestMemoryId}` : "/upload"}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
              >
                {dominantEmotion ? "動物カードを見る" : "日記を書く"}
                <ChevronRight className="size-4" aria-hidden />
              </Link>
            </div>
            <div className="relative h-44">
              <MoodAnimal
                src={partner.glb}
                accent={partner.accent}
                className="absolute inset-0 h-44 w-full"
                actionTick={0}
              />
            </div>
          </div>
        </motion.section>

        <motion.section variants={itemVariants} className="mt-6">
          <NotebookSectionTitle title="よく現れる感情" icon={PawPrint} />
          <EmotionSummaryPanel
            items={emotionSummary}
            loading={loadingSummary}
            total={totalSummarizedMemories}
          />
          <p className="mt-3 text-[12px] text-muted-foreground">
            集計期間は直近{EMOTION_SUMMARY_DAYS}日です。動物カードと見比べながら、最近の自分の傾向を振り返れます。
          </p>
        </motion.section>

        <motion.section variants={itemVariants} className="mt-7">
          <NotebookSectionTitle title="あなたの記録" icon={BookOpen} />
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard
              icon={BookOpen}
              label="集計した思い出"
              value={loadingSummary ? "..." : String(totalSummarizedMemories)}
              unit="件"
            />
            <StatCard icon={Camera} label="集計期間" value={String(EMOTION_SUMMARY_DAYS)} unit="日" />
            <StatCard
              icon={PawPrint}
              label="相棒発見"
              value={
                loadingSummary
                  ? "..."
                  : String(emotionSummary.filter((item) => item.count > 0).length)
              }
              unit="種類"
            />
          </div>
          <p className="mt-3 text-[12px] text-muted-foreground">
            これまでのあなたの思い出の軌跡です。
          </p>
        </motion.section>

        <motion.section variants={itemVariants} className="relative mt-7">
          <WashiTape className="-top-3 left-8" />
          <Link
            href={DEFAULT_ROADMAP_HREF}
            className="block rounded-[0.35rem] bg-[#f3d878] px-6 py-5 shadow-soft ring-1 ring-[#d4b757]/35 transition hover:-translate-y-0.5 hover:bg-[#f5de87]"
          >
            <div className="flex items-center gap-2">
              <Star className="size-5 text-mono-ink" aria-hidden />
              <h2 className="font-serif text-xl font-semibold text-mono-ink">
                次の夢（夢のロードマップ）
              </h2>
            </div>
            <DottedDivider className="my-4 opacity-70" />
            <p className="text-lg font-semibold text-mono-ink">温泉旅行へ行く</p>
            <div className="mt-4 flex items-center gap-4">
              <span className="text-sm text-mono-ink/75">達成率</span>
              <span className="h-3 w-40 overflow-hidden rounded-full bg-white/70 ring-1 ring-mono-ink/10">
                <span className="block h-full w-[65%] rounded-full bg-primary" />
              </span>
              <span className="font-semibold tabular-nums text-mono-ink">65%</span>
            </div>
          </Link>
        </motion.section>

        <motion.section variants={itemVariants} className="mt-7">
          <NotebookSectionTitle title="設定" icon={Shield} />
          <div className="grid gap-x-7 rounded-[1rem] border border-mono-linen/35 bg-white/45 p-5 shadow-soft ring-1 ring-white/45 md:grid-cols-2">
            <SettingRow
              icon={Bell}
              label="通知設定"
              control={
                <Toggle
                  label="プッシュ通知"
                  checked={notifications.push}
                  onChange={(v) => updateNotifications({ push: v })}
                />
              }
            />
            <SettingRow
              icon={Lock}
              label="プッシュ通知"
              control={
                <Toggle
                  label="メール通知"
                  checked={notifications.email}
                  onChange={(v) => updateNotifications({ email: v })}
                />
              }
            />
            <SettingRow
              icon={Mail}
              label="メール通知"
              value={maskEmail(profile.email)}
            />
            <SettingRow icon={Shield} label="データとプライバシー" value="管理する" />
            <SettingRow
              icon={LinkIcon}
              label="Googleアカウント連携"
              value={profile.email ? "連携済み" : "未連携"}
              onClick={!profile.email ? handleGoogleLogin : undefined}
            />
            <SettingRow
              icon={LogOut}
              label="ログアウト"
              value="実行する"
              danger
              onClick={() => {
                if (
                  !window.confirm(
                    "ログアウトすると、この端末に保存した表示名・通知・アバター、案内の完了状態、分析の一時データが消去されます。よろしいですか？",
                  )
                ) {
                  return;
                }
                void logOut();
                router.replace("/onboarding");
              }}
            />
            <SettingRow
              icon={Eraser}
              label="この端末のデータ消去"
              value="消去する"
              danger
              onClick={() => {
                if (window.confirm("この端末に保存された設定を消去します。よろしいですか？")) {
                  clearLocal();
                }
              }}
            />
          </div>
        </motion.section>

        <footer className="mt-9 text-center">
          <p className="font-serif text-lg font-semibold text-[#d796a4]">
            Every feeling shapes you.
          </p>
          <DottedDivider className="mx-auto mt-3 max-w-[18rem]" />
          <p className="mt-3 font-serif text-base font-bold uppercase tracking-[0.22em] text-mono-ink">
            MEMORIA
          </p>
        </footer>
      </NotebookSheet>
    </motion.main>
  );
}

function ProfilePhoto({
  src,
  onFileSelect,
}: {
  src: string | null;
  onFileSelect: (file: File) => void;
}) {
  const inputId = useId();

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) onFileSelect(file);
  }

  return (
    <div className="relative mx-auto w-[10.5rem] rotate-[-4deg] md:mx-0">
      <WashiTape className="-top-4 left-12" />
      <input
        id={inputId}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={onChange}
      />
      <label
        htmlFor={inputId}
        className="block cursor-pointer bg-white p-3 pb-6 shadow-elev ring-1 ring-mono-ink/8 transition hover:rotate-1"
      >
        <span className="sr-only">プロフィール写真を変更</span>
        <span className="relative grid aspect-square place-items-center overflow-hidden bg-[#e8ead9]">
          {src ? (
            <Image
              src={src}
              alt=""
              fill
              sizes="168px"
              className="object-cover"
              draggable={false}
              unoptimized
            />
          ) : (
            <DefaultFace />
          )}
        </span>
        <span className="mt-3 block truncate text-center text-sm text-mono-ink/75">
          自由っぽい・ネコ
        </span>
      </label>
    </div>
  );
}

function DefaultFace() {
  return (
    <svg viewBox="0 0 120 120" className="size-[7.2rem]" aria-hidden>
      <path d="M33 42 28 18 49 34Z" fill="#d7892d" />
      <path d="M87 42 92 18 71 34Z" fill="#d7892d" />
      <circle cx="60" cy="64" r="38" fill="#e7a13a" />
      <path d="M35 57H17M38 67H18M85 57h18M82 67h20" stroke="#7a552e" strokeWidth="3" strokeLinecap="round" />
      <circle cx="46" cy="58" r="4" fill="#4a3a25" />
      <circle cx="74" cy="58" r="4" fill="#4a3a25" />
      <path d="M60 62v8M51 75c4 5 14 5 18 0" stroke="#4a3a25" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function Sticker({ tone, children }: { tone: "rose" | "sun" | "sage"; children: ReactNode }) {
  return (
    <span
      className={cn(
        "rounded-full px-5 py-2 text-sm font-semibold ring-1 ring-black/5",
        tone === "rose" && "bg-[#eaa0ad] text-[#704651]",
        tone === "sun" && "bg-[#f3d46f] text-[#6c5b28]",
        tone === "sage" && "bg-mono-sage/45 text-mono-ink",
      )}
    >
      {children}
    </span>
  );
}

function EmotionSummaryPanel({
  items,
  loading,
  total,
}: {
  items: EmotionSummaryItem[];
  loading: boolean;
  total: number;
}) {
  if (loading) {
    return (
      <div className="rounded-[1rem] bg-white/50 px-5 py-6 text-sm text-muted-foreground shadow-ambient ring-1 ring-mono-ink/6">
        感情の割合を集計しています...
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="rounded-[1rem] bg-white/50 px-5 py-6 shadow-ambient ring-1 ring-mono-ink/6">
        <p className="text-sm font-semibold text-mono-ink">まだ集計できる日記がありません。</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          写真とひとことを残すと、感情の割合と相棒の傾向がここに表示されます。
        </p>
        <Link
          href="/upload"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[12px] font-semibold text-primary-foreground shadow-soft"
        >
          日記を書く
          <ChevronRight className="size-3" aria-hidden />
        </Link>
      </div>
    );
  }

  const top = items.find((item) => item.count > 0);

  return (
    <div className="rounded-[1rem] bg-white/50 p-4 shadow-ambient ring-1 ring-mono-ink/6 sm:p-5">
      {top && (
        <div className="mb-4 rounded-[0.8rem] bg-white/55 px-4 py-3 ring-1 ring-mono-ink/6">
          <p className="text-[12px] font-semibold tracking-[0.08em] text-muted-foreground">
            いちばん多い感情
          </p>
          <p className="mt-1 text-base font-semibold text-mono-ink">
            {top.emoji} {top.label}が {top.percent}%。最近は「{top.topEmotion}」の気配が強めです。
          </p>
        </div>
      )}
      <div className="space-y-3">
        {items.map((item) => {
          const content = (
            <div className="grid gap-2 rounded-[0.8rem] bg-white/45 px-4 py-3 ring-1 ring-mono-ink/6 transition hover:bg-white/65 sm:grid-cols-[8.5rem_1fr_4rem] sm:items-center">
              <div className="flex min-w-0 items-center gap-2">
                <span className="text-xl" aria-hidden>
                  {item.emoji}
                </span>
                <span className="min-w-0 truncate text-sm font-semibold text-mono-ink">
                  {item.label}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-mono-linen/35">
                <span
                  className="block h-full rounded-full transition-[width]"
                  style={{ width: `${item.percent}%`, background: item.accent }}
                />
              </div>
              <div className="flex items-baseline justify-between gap-2 text-right sm:block">
                <span className="text-[12px] text-muted-foreground sm:hidden">{item.count}件</span>
                <span className="font-serif text-xl font-bold tabular-nums text-mono-ink">
                  {item.percent}
                  <span className="ml-0.5 text-[12px] font-semibold">%</span>
                </span>
              </div>
            </div>
          );

          if (item.latestMemoryId) {
            return (
              <Link key={item.animalId} href={`/animal-card/${item.latestMemoryId}`} className="block">
                {content}
              </Link>
            );
          }

          return (
            <div key={item.animalId} className="opacity-45">
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  unit,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="rounded-[0.9rem] bg-white/50 px-5 py-4 text-center shadow-ambient ring-1 ring-mono-ink/6">
      <div className="flex items-center justify-center gap-2 text-sm text-[#b47f65]">
        <Icon className="size-4" aria-hidden />
        {label}
      </div>
      <p className="mt-2 font-serif text-3xl font-bold text-mono-ink">
        {value}
        <span className="ml-1 text-base font-semibold">{unit}</span>
      </p>
    </div>
  );
}

function SettingRow({
  icon: Icon,
  label,
  value,
  control,
  danger,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  value?: string;
  control?: ReactNode;
  danger?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <>
      <span className="flex min-w-0 items-center gap-3">
        <Icon className="size-4 shrink-0 text-mono-ink/65" aria-hidden />
        <span className="truncate text-sm text-mono-ink">{label}</span>
      </span>
      <span className="flex shrink-0 items-center gap-2 text-[12px] font-semibold">
        {control ?? (
          <>
            <span className={danger ? "text-[#c97871]" : "text-muted-foreground"}>
              {value}
            </span>
            <ChevronRight className="size-4 text-muted-foreground/70" aria-hidden />
          </>
        )}
      </span>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="grid min-h-12 w-full grid-cols-[1fr_auto] items-center gap-3 border-b border-mono-linen/35 py-2.5 text-left last:border-b-0"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="grid min-h-12 grid-cols-[1fr_auto] items-center gap-3 border-b border-mono-linen/35 py-2.5 last:border-b-0">
      {content}
    </div>
  );
}
