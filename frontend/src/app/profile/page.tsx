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
import { fileToAvatarDataUrl } from "@/lib/avatar-image";
import { useProfile } from "@/lib/hooks/use-profile";
import {
  isMemoryAnimalId,
  MEMORY_ANIMAL_MAP,
  type MemoryRecord,
} from "@/lib/memory-records";
import { getAnimal } from "@/lib/mood";
import { transitions } from "@/lib/motion";
import { tanzakuApi, type TanzakuWish } from "@/lib/api/tanzaku";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const EMOTION_TONES = ["rose", "sage", "sun", "violet"] as const;

type EmotionTone = (typeof EMOTION_TONES)[number];

function frequentEmotions(memories: MemoryRecord[]) {
  const counts = new Map<string, { count: number; firstIndex: number }>();

  memories.forEach((memory, index) => {
    const emotion = memory.emotion.trim();
    if (!emotion) return;
    const current = counts.get(emotion);
    counts.set(emotion, current ? { ...current, count: current.count + 1 } : { count: 1, firstIndex: index });
  });

  return [...counts.entries()]
    .sort(([, a], [, b]) => b.count - a.count || a.firstIndex - b.firstIndex)
    .slice(0, 4)
    .map(([label], index) => ({ label, tone: EMOTION_TONES[index] }));
}

function wishProgress(wish: TanzakuWish | null) {
  if (!wish || wish.steps.length === 0) return 0;
  return Math.round((wish.steps.filter((step) => step.done).length / wish.steps.length) * 100);
}

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
  const [memories, setMemories] = useState<MemoryRecord[]>([]);
  const [activeWish, setActiveWish] = useState<TanzakuWish | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadMemories() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) return [];

      const { data, error } = await supabase
        .from("memories")
        .select("id, image_url, diary_text, emotion, animal_id, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as MemoryRecord[];
    }

    async function loadSummary() {
      const [memoriesResult, wishesResult] = await Promise.allSettled([
        loadMemories(),
        tanzakuApi.list("active"),
      ]);

      if (cancelled) return;
      if (memoriesResult.status === "fulfilled") setMemories(memoriesResult.value);
      if (wishesResult.status === "fulfilled") setActiveWish(wishesResult.value.items[0] ?? null);
      if (memoriesResult.status === "rejected" || wishesResult.status === "rejected") {
        setSummaryError("一部の記録を取得できませんでした。時間をおいて再読み込みしてください。");
      }
      setIsSummaryLoading(false);
    }

    void loadSummary();
    return () => {
      cancelled = true;
    };
  }, []);

  const partner = useMemo(() => {
    const animalId = memories[0]?.animal_id;
    return animalId && isMemoryAnimalId(animalId)
      ? getAnimal(MEMORY_ANIMAL_MAP[animalId])
      : null;
  }, [memories]);
  const topEmotions = useMemo(() => frequentEmotions(memories), [memories]);
  const photoCount = memories.filter((memory) => Boolean(memory.image_url)).length;
  const companionCount = new Set(
    memories
      .map((memory) => memory.animal_id)
      .filter(isMemoryAnimalId)
      .map((animalId) => MEMORY_ANIMAL_MAP[animalId]),
  ).size;
  const activeWishProgress = wishProgress(activeWish);
  const activeWishHref = activeWish ? `/roadmap/${activeWish.id}` : "/tanzaku";

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
          typeof window !== "undefined" ? `${window.location.origin}/profile` : "/",
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
          <ProfilePhoto
            src={profile.avatarUrl}
            partnerLabel={partner ? `${partner.label}・${partner.emoji}` : "まだ記録がありません"}
            onFileSelect={onAvatarFile}
          />

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
            {topEmotions.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {topEmotions.slice(0, 3).map(({ label }, index) => (
                  <Sticker key={label} tone={index === 0 ? "rose" : index === 1 ? "sun" : "sage"}>
                    {label}
                  </Sticker>
                ))}
              </div>
            )}
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
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {partner
                  ? partner.tagline
                  : "思い出を記録すると、その日の気持ちに合う相棒が現れます。"}
              </p>
            </div>
            <div className="relative h-44">
              {partner ? (
                <MoodAnimal
                  src={partner.glb}
                  accent={partner.accent}
                  className="absolute inset-0 h-44 w-full"
                  actionTick={0}
                />
              ) : (
                <div className="grid h-full place-items-center text-4xl" aria-hidden>
                  ✧
                </div>
              )}
            </div>
          </div>
        </motion.section>

        <motion.section variants={itemVariants} className="mt-6">
          <NotebookSectionTitle title="よく現れる感情" icon={PawPrint} />
          {topEmotions.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {topEmotions.map(({ label, tone }, index) => (
                <EmotionPill key={label} icon={["●", "✿", "★", "✦"][index]} label={label} tone={tone} />
              ))}
            </div>
          ) : (
            <p className="rounded-[0.9rem] bg-white/50 px-5 py-4 text-center text-sm text-muted-foreground shadow-ambient ring-1 ring-mono-ink/6">
              まだ感情の記録がありません。
            </p>
          )}
          <p className="mt-3 text-[12px] text-muted-foreground">
            {topEmotions.length > 0
              ? "思い出に記録された感情のうち、よく現れるものです。"
              : "思い出を記録すると、ここに感情の傾向が表示されます。"}
          </p>
        </motion.section>

        <motion.section variants={itemVariants} className="mt-7">
          <NotebookSectionTitle title="あなたの記録" icon={BookOpen} />
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard icon={BookOpen} label="思い出数" value={isSummaryLoading ? "…" : String(memories.length)} unit="件" />
            <StatCard icon={Camera} label="写真" value={isSummaryLoading ? "…" : String(photoCount)} unit="枚" />
            <StatCard icon={PawPrint} label="相棒発見" value={isSummaryLoading ? "…" : String(companionCount)} unit="種類" />
          </div>
          <p className="mt-3 text-[12px] text-muted-foreground">
            {summaryError ?? "これまでのあなたの思い出の軌跡です。"}
          </p>
        </motion.section>

        <motion.section variants={itemVariants} className="relative mt-7">
          <WashiTape className="-top-3 left-8" />
          <Link
            href={activeWishHref}
            className="block rounded-[0.35rem] bg-[#f3d878] px-6 py-5 shadow-soft ring-1 ring-[#d4b757]/35 transition hover:-translate-y-0.5 hover:bg-[#f5de87]"
          >
            <div className="flex items-center gap-2">
              <Star className="size-5 text-mono-ink" aria-hidden />
              <h2 className="font-serif text-xl font-semibold text-mono-ink">
                次の夢（夢のロードマップ）
              </h2>
            </div>
            <DottedDivider className="my-4 opacity-70" />
            {activeWish ? (
              <>
                <p className="text-lg font-semibold text-mono-ink">{activeWish.dream}</p>
                <div className="mt-4 flex items-center gap-4">
                  <span className="text-sm text-mono-ink/75">達成率</span>
                  <span className="h-3 w-40 overflow-hidden rounded-full bg-white/70 ring-1 ring-mono-ink/10">
                    <span
                      className="block h-full rounded-full bg-primary"
                      style={{ width: `${activeWishProgress}%` }}
                    />
                  </span>
                  <span className="font-semibold tabular-nums text-mono-ink">{activeWishProgress}%</span>
                </div>
              </>
            ) : (
              <p className="text-lg font-semibold text-mono-ink">
                {isSummaryLoading ? "夢を読み込んでいます…" : "次の夢を短冊に書いてみよう"}
              </p>
            )}
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
  partnerLabel,
  onFileSelect,
}: {
  src: string | null;
  partnerLabel: string;
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
          {partnerLabel}
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

function EmotionPill({
  icon,
  label,
  tone,
}: {
  icon: string;
  label: string;
  tone: EmotionTone;
}) {
  return (
    <div className="flex min-h-16 items-center justify-center gap-3 rounded-[0.9rem] bg-white/50 px-4 py-3 shadow-ambient ring-1 ring-mono-ink/6">
      <span
        className={cn(
          "text-xl",
          tone === "rose" && "text-[#d98fa2]",
          tone === "sage" && "text-mono-sage",
          tone === "sun" && "text-[#e8bd42]",
          tone === "violet" && "text-[#b8a5d8]",
        )}
        aria-hidden
      >
        {icon}
      </span>
      <span className="text-sm font-semibold text-mono-ink">{label}</span>
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
