"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { Avatar } from "@/components/avatar";
import { ProfileHalo } from "@/components/profile/profile-halo";
import { Section } from "@/components/profile/section";
import { Toggle } from "@/components/profile/toggle";
import { useProfile } from "@/lib/hooks/use-profile";
import { fileToAvatarDataUrl } from "@/lib/avatar-image";
import { DEFAULT_ROADMAP_HREF } from "@/lib/app-paths";
import { transitions } from "@/lib/motion";
import { cn } from "@/lib/utils";
// ▼ 追加: Supabaseクライアントをインポート
import { supabase } from "@/lib/supabase";

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
  const reduced = useReducedMotion();
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

  const containerVariants = reduced
      ? { initial: {}, animate: {} }
      : {
        initial: {},
        animate: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
      };

  const itemVariants = reduced
      ? { initial: {}, animate: {} }
      : {
        initial: { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0, transition: transitions.gentle },
      };

  function startEdit() {
    setDraftName(profile.displayName);
    setEditing(true);
  }

  async function saveEdit() {
    const trimmed = draftName.trim();
    if (!trimmed) {
      setEditing(false);
      return;
    }
    await updateProfile({ displayName: trimmed });
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

  // ▼ 追加: ゲストユーザーが後からGoogleアカウントを連携する処理
  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // ログイン完了後、このプロフィール画面に戻ってくるように設定
        redirectTo: typeof window !== "undefined" ? `${window.location.origin}/profile` : "/",
      },
    });
  }

  return (
      <div className="relative min-h-[calc(100vh-var(--nav-height))]">
        <ProfileHalo />

        <motion.div
            className="mx-auto w-full max-w-md px-6 pt-14 pb-10"
            variants={containerVariants}
            initial="initial"
            animate="animate"
        >
          {/* ────── Header ────── */}
          <motion.header
              variants={itemVariants}
              className="flex flex-col items-center text-center"
          >
            <Avatar
                size="lg"
                src={profile.avatarUrl}
                editable
                onFileSelect={onAvatarFile}
            />
            <h1 className="mt-6 text-[26px] font-semibold leading-tight tracking-tight">
              {profile.displayName}
            </h1>
            <p className="mt-2 text-[11px] tracking-[0.24em] text-muted-foreground/85">
              MonoLog · MEMBER
            </p>
          </motion.header>

          {/* primary グラデ下線で header → body を遷移 */}
          <motion.div
              aria-hidden
              variants={itemVariants}
              className="my-12 h-px"
              style={{
                background:
                    "linear-gradient(90deg, transparent 0%, color-mix(in oklab, var(--primary) 24%, transparent) 50%, transparent 100%)",
              }}
          />

          <motion.div variants={itemVariants}>
            <Link
                href={DEFAULT_ROADMAP_HREF}
                className="group flex items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-mono-paper/50 px-4 py-3.5 text-left ring-1 ring-primary/10 backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-mono-paper/70"
                style={{
                  boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.65), 0 6px 20px rgba(45, 40, 32, 0.04)",
                }}
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">夢のロードマップ</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  目標の進捗とステップを確認
                </p>
              </div>
              <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="shrink-0 text-primary/80 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>
          </motion.div>

          <div className="h-8" aria-hidden />

          {/* ────── 01 PROFILE ────── */}
          <motion.div variants={itemVariants}>
            <Section
                number="01"
                eyebrow="PROFILE"
                title="ニックネーム"
                description="他の人に表示される名前です。いつでも変更できます。"
            >
              <Surface>
                {!editing ? (
                    <div className="flex items-baseline justify-between gap-4 px-5 py-4">
                      <p className="truncate text-base font-medium tracking-tight">
                        {profile.displayName}
                      </p>
                      <button
                          type="button"
                          onClick={startEdit}
                          className="shrink-0 text-xs font-medium text-primary underline-offset-4 transition-opacity hover:underline hover:opacity-80"
                      >
                        編集する
                      </button>
                    </div>
                ) : (
                    <div className="space-y-4 px-5 py-4">
                      <input
                          type="text"
                          value={draftName}
                          onChange={(e) => setDraftName(e.target.value)}
                          autoFocus
                          maxLength={24}
                          placeholder="表示名を入力"
                          className="w-full border-b border-foreground/15 bg-transparent pb-1 text-base font-medium tracking-tight outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/60"
                      />
                      <div className="flex items-center gap-5 text-xs">
                        <button
                            type="button"
                            onClick={saveEdit}
                            className="font-medium text-primary underline-offset-4 hover:underline"
                        >
                          保存する
                        </button>
                        <button
                            type="button"
                            onClick={() => setEditing(false)}
                            className="text-muted-foreground underline-offset-4 hover:underline"
                        >
                          キャンセル
                        </button>
                      </div>
                    </div>
                )}
              </Surface>
            </Section>
          </motion.div>

          <Gap />

          {/* ────── 02 NOTIFICATIONS ────── */}
          <motion.div variants={itemVariants}>
            <Section
                number="02"
                eyebrow="NOTIFICATIONS"
                title="通知"
                description="お知らせの届け方を選べます。"
            >
              <Surface>
                <NotifRow
                    label="プッシュ通知"
                    hint="記録のリマインドを端末に届けます。"
                    checked={notifications.push}
                    onChange={(v) => updateNotifications({ push: v })}
                />
                <Hairline />
                <NotifRow
                    label="メール通知"
                    hint="重要なお知らせをメールで受け取ります。"
                    checked={notifications.email}
                    onChange={(v) => updateNotifications({ email: v })}
                />
              </Surface>
              <Note>
                プッシュ通知の実配信はサーバー連携後に有効になります。現在は設定のみ保存されます。
              </Note>
            </Section>
          </motion.div>

          <Gap />

          {/* ────── 03 ACCOUNT ────── */}
          <motion.div variants={itemVariants}>
            <Section
                number="03"
                eyebrow="ACCOUNT"
                title="アカウント情報"
                description="現在の登録情報です。"
            >
              <Surface as="dl" className="divide-y divide-white/45">
                <DefRow
                    term="メールアドレス"
                    desc={
                      <span className="font-mono text-[13px] tabular-nums">
                    {maskEmail(profile.email)}
                  </span>
                    }
                />
                <DefRow term="登録日" desc={profile.joinedAt ?? "連携予定"} />
              </Surface>

              {/* ▼ 追加: ゲストユーザー（emailが無い）場合のみ、連携ボタンを表示 */}
              {!profile.email && (
                  <div className="mt-4">
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-4 py-3.5 text-sm font-semibold text-foreground shadow-sm ring-1 ring-mono-ink/5 transition-all hover:bg-gray-50 active:scale-[0.98]"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Googleアカウントと連携する
                    </button>
                    <p className="mt-2 text-center text-[11px] leading-relaxed text-muted-foreground/85">
                      連携すると、データがクラウドに保存され、<br />他の端末からも思い出を引き継げるようになります。
                    </p>
                  </div>
              )}
            </Section>
          </motion.div>

          <Gap />

          {/* ────── 04 DATA & PRIVACY ────── */}
          <motion.div variants={itemVariants}>
            <Section
                number="04"
                eyebrow="DATA & PRIVACY"
                title="データとプライバシー"
                description="この端末に保存された情報を管理します。"
            >
              <Surface>
                <ActionRow
                    label="設定をこの端末から消去"
                    hint="表示名・通知設定など、ローカル保存情報をクリアします。"
                    actionLabel="消去する"
                    tone="danger"
                    onAction={() => {
                      if (
                          window.confirm(
                              "この端末に保存された設定を消去します。よろしいですか？",
                          )
                      ) {
                        clearLocal();
                      }
                    }}
                />
              </Surface>
            </Section>
          </motion.div>

          {/* ────── Logout ────── */}
          <motion.div variants={itemVariants} className="mt-14">
            <button
                type="button"
                onClick={() => {
                  if (
                      !window.confirm(
                          "ログアウトすると、この端末に保存した表示名・通知・アバター、案内の完了状態、分析の一時データが消去されます。よろしいですか？",
                      )
                  ) {
                    return;
                  }
                  logOut();
                  router.replace("/onboarding");
                }}
                className="block w-full rounded-2xl bg-white/45 py-3.5 text-sm font-medium text-[#FF6B6B] ring-1 ring-[#FF6B6B]/22 backdrop-blur-md transition-all hover:bg-[#FF6B6B]/10 hover:ring-[#FF6B6B]/35 active:translate-y-px"
                style={{
                  boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.55), 0 6px 18px rgba(255,107,107,0.08)",
                }}
            >
              ログアウト
            </button>
            <p className="mt-3 text-center text-[11px] leading-relaxed text-muted-foreground/85">
              端末内の表示名・通知などを消去し、案内（オンボーディング）から最初に戻ります。サーバーアカウントは未接続のため、連携時は別途サインアウト操作が必要になる場合があります。
            </p>
          </motion.div>
        </motion.div>
      </div>
  );
}

/* ──────────────── building blocks ──────────────── */

function Gap() {
  return <div className="h-12" aria-hidden />;
}

function Note({ children }: { children: React.ReactNode }) {
  return (
      <p className="mt-3 px-1 text-[11px] leading-relaxed text-muted-foreground/85">
        {children}
      </p>
  );
}

function Hairline() {
  return <div aria-hidden className="mx-5 h-px bg-white/55" />;
}

interface SurfaceProps {
  as?: "div" | "dl";
  className?: string;
  children: React.ReactNode;
}

function Surface({ as = "div", className, children }: SurfaceProps) {
  const Cmp = as as "div";
  return (
      <Cmp
          className={cn(
              "rounded-2xl bg-white/45 ring-1 ring-white/45 backdrop-blur-md",
              className,
          )}
          style={{
            boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.65), 0 8px 24px rgba(32,20,80,0.05)",
          }}
      >
        {children}
      </Cmp>
  );
}

function NotifRow({
                    label,
                    hint,
                    checked,
                    onChange,
                  }: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
      <div className="flex items-center justify-between gap-5 px-5 py-4">
        <div className="min-w-0">
          <p className="text-sm font-medium tracking-tight">{label}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            {hint}
          </p>
        </div>
        <Toggle label={label} checked={checked} onChange={onChange} />
      </div>
  );
}

function DefRow({ term, desc }: { term: string; desc: React.ReactNode }) {
  return (
      <div className="flex items-baseline justify-between gap-5 px-5 py-3.5">
        <dt className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
          {term}
        </dt>
        <dd className="text-sm tracking-tight">{desc}</dd>
      </div>
  );
}

function ActionRow({
                     label,
                     hint,
                     actionLabel,
                     onAction,
                     tone,
                   }: {
  label: string;
  hint: string;
  actionLabel: string;
  onAction: () => void;
  tone?: "danger";
}) {
  return (
      <div className="flex items-start justify-between gap-5 px-5 py-4">
        <div className="min-w-0">
          <p className="text-sm font-medium tracking-tight">{label}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            {hint}
          </p>
        </div>
        <button
            type="button"
            onClick={onAction}
            className={cn(
                "shrink-0 text-xs font-medium underline-offset-4 transition-opacity hover:underline hover:opacity-80",
                tone === "danger" ? "text-[#FF6B6B]" : "text-primary",
            )}
        >
          {actionLabel}
        </button>
      </div>
  );
}