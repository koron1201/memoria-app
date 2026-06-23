import Link from "next/link";
import { BookOpen, Grid2X2, Home, Star, UserRound, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type NotebookTab = {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
};

export const notebookTabs = {
  home: { href: "/", label: "ホーム", icon: Home },
  memory: { href: "/memory", label: "思い出", icon: Grid2X2 },
  tanzaku: { href: "/tanzaku", label: "夢", icon: Star },
  profile: { href: "/profile", label: "マイページ", icon: UserRound },
} as const;

export function NotebookSheet({
  children,
  className,
  maxWidth = "max-w-6xl",
}: {
  children: React.ReactNode;
  className?: string;
  maxWidth?: string;
}) {
  return (
    <div className={cn("relative mx-auto w-full px-4 py-6 sm:px-6 sm:py-8", maxWidth)}>
      <section
        className={cn(
          "relative overflow-hidden rounded-[0.55rem] border border-mono-linen/45 bg-mono-paper text-mono-ink shadow-elev",
          "px-5 pb-8 pt-6 sm:px-8 sm:pb-10 sm:pt-7",
          className,
        )}
        style={{
          backgroundImage:
            "radial-gradient(color-mix(in oklab, var(--mono-sage) 16%, transparent) 0.72px, transparent 0.72px)",
          backgroundSize: "14px 14px",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-75"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.44) 42%, rgba(255,255,255,0.22) 100%)",
          }}
        />
        <div className="relative min-[760px]:pr-[6rem]">{children}</div>
      </section>
    </div>
  );
}

export function NotebookHeader({
  eyebrow,
  title = "MEMORIA",
  page,
  action,
}: {
  eyebrow?: string;
  title?: string;
  page?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 font-serif text-[1.08rem] font-bold uppercase tracking-[0.22em] text-mono-ink">
          {title}
        </h1>
        <DottedDivider className="mt-3 max-w-[18rem]" />
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {page && <p className="font-serif text-sm font-semibold text-[#d796a4]">{page}</p>}
        {action}
      </div>
    </header>
  );
}

export function NotebookSectionTitle({
  number,
  label,
  title,
  icon: Icon = BookOpen,
  className,
}: {
  number?: string;
  label?: string;
  title: string;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div className={cn("mb-3 flex items-center gap-2", className)}>
      {number && (
        <span className="font-mono text-[10px] tracking-[0.2em] text-primary/85">
          {number}
        </span>
      )}
      <Icon className="size-4 text-[#c9788f]" aria-hidden />
      <div className="min-w-0">
        {label && (
          <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-muted-foreground/70">
            {label}
          </p>
        )}
        <h2 className="font-serif text-base font-semibold tracking-normal text-mono-ink">
          {title}
        </h2>
      </div>
      <DottedDivider className="ml-2 flex-1" />
    </div>
  );
}

export function DottedDivider({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("block h-px", className)}
      style={{
        backgroundImage:
          "repeating-linear-gradient(90deg, color-mix(in oklab, var(--mono-sage) 48%, transparent) 0 3px, transparent 3px 8px)",
      }}
    />
  );
}

export function WashiTape({
  className,
  tone = "rose",
}: {
  className?: string;
  tone?: "rose" | "sage";
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "absolute z-10 h-6 w-16 rotate-[-10deg] opacity-75",
        tone === "rose" ? "bg-[#efb6c6]" : "bg-mono-sage/40",
        className,
      )}
      style={{
        backgroundImage:
          "repeating-linear-gradient(45deg, rgba(255,255,255,0.25) 0 6px, transparent 6px 12px)",
      }}
    />
  );
}

export function NotebookSideTabs({ active }: { active: keyof typeof notebookTabs }) {
  const tabs: NotebookTab[] = [
    { ...notebookTabs.home, active: active === "home" },
    { ...notebookTabs.memory, active: active === "memory" },
    { ...notebookTabs.tanzaku, active: active === "tanzaku" },
    { ...notebookTabs.profile, active: active === "profile" },
  ];

  return (
    <nav
      aria-label="ノートインデックス"
      className="group absolute right-0 top-0 z-20 hidden h-12 w-5 overflow-hidden rounded-bl-[0.75rem] rounded-tl-[0.75rem] border border-r-0 border-mono-linen/40 bg-mono-cream/80 shadow-soft ring-1 ring-white/50 transition-[height,width] duration-200 ease-out hover:h-[18.6rem] hover:w-20 focus-within:h-[18.6rem] focus-within:w-20 min-[760px]:block"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-primary/88 transition-opacity duration-150 group-hover:opacity-0 group-focus-within:opacity-0"
      />
      {tabs.map(({ href, label, icon: Icon, active: isActive }) => (
        <Link
          key={href}
          href={href}
          aria-current={isActive ? "page" : undefined}
          className={cn(
            "flex h-[4.65rem] w-20 flex-col items-center justify-center gap-1.5 border-b border-mono-ink/6 px-2 text-[12px] font-semibold leading-tight opacity-0 transition last:border-b-0 group-hover:opacity-100 group-focus-within:opacity-100",
            isActive
              ? "bg-primary text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.28)]"
              : "bg-[#fffdf6]/92 text-mono-ink/78 hover:bg-white hover:text-mono-ink",
          )}
        >
          <Icon
            className={cn(
              "size-5",
              isActive ? "text-primary-foreground" : "text-primary/80",
            )}
            aria-hidden
          />
          <span className="text-center">{label}</span>
        </Link>
      ))}
    </nav>
  );
}
