"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const iconClass =
  "transition-[color,transform] duration-200 [&_svg]:text-current";

const items = {
  home: (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  ),
  memory: (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="10" width="7" height="11" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  tanzaku: (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z" />
    </svg>
  ),
  profile: (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
    </svg>
  ),
  plus: (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
} as const;

type SideItem = { href: string; label: string; icon: (typeof items)[keyof typeof items] };

const left: SideItem[] = [
  { href: "/", label: "ホーム", icon: items.home },
  { href: "/memory", label: "思い出", icon: items.memory },
];

const right: SideItem[] = [
  { href: "/tanzaku", label: "夢", icon: items.tanzaku },
  { href: "/profile", label: "マイページ", icon: items.profile },
];

function isActivePath(pathname: string | null, href: string): boolean {
  if (href === "/") return pathname === "/";
  if (!pathname) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavPill({
  item,
  pathname,
}: {
  item: SideItem;
  pathname: string | null;
}) {
  const active = isActivePath(pathname, item.href);
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex min-h-[2.75rem] min-w-0 flex-1 flex-col items-center justify-end gap-0.5 rounded-2xl px-1.5 pb-0.5 pt-1 text-[10px] font-medium tracking-wide transition-[color,background] duration-200 ease-out",
        active
          ? "text-mono-ink"
          : "text-muted-foreground/65 hover:text-foreground/88",
      )}
    >
      {active && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-2xl bg-[color:color-mix(in_oklab,var(--mono-sage)_12%,transparent)]"
          style={{
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.55), 0 1px 0 color-mix(in oklab, var(--mono-sage) 10%, transparent)",
          }}
        />
      )}
      <span
        className={cn(
          "relative",
          iconClass,
          active
            ? "text-mono-ink [&_svg]:text-mono-sage"
            : "[&_svg]:text-muted-foreground/55 group-hover:[&_svg]:text-foreground/75",
        )}
      >
        {item.icon}
      </span>
      <span className="relative leading-none">{item.label}</span>
    </Link>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  if (pathname?.startsWith("/onboarding")) {
    return null;
  }

  const fabActive = pathname?.startsWith("/upload");

  return (
    <nav
      aria-label="メインナビゲーション"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center pb-safe"
      style={{
        paddingLeft: "var(--nav-float-inset)",
        paddingRight: "var(--nav-float-inset)",
      }}
    >
      <div className="shell-floating pointer-events-auto relative mb-3 w-full max-w-lg pt-1">
        <div className="flex w-full items-end">
          <div className="flex min-w-0 flex-1 items-end justify-between gap-0.5 pr-0.5">
            {left.map((item) => (
              <NavPill key={item.href} item={item} pathname={pathname} />
            ))}
          </div>

          <div className="relative flex w-[4.5rem] shrink-0 flex-col items-center">
            <Link
              href="/upload"
              aria-current={fabActive ? "page" : undefined}
              className={cn(
                "pointer-events-auto absolute -top-6 flex h-[3.35rem] w-[3.35rem] items-center justify-center rounded-full text-white shadow-elev",
                "bg-gradient-to-br from-mono-sage to-[color:color-mix(in_oklab,var(--mono-sage)_70%,#3a3834)]",
                "ring-2 ring-white/55 transition-transform active:scale-95",
                fabActive && "ring-4 ring-mono-sage/30",
              )}
            >
              <span className="drop-shadow-sm">{items.plus}</span>
              <span className="sr-only">記録（アップロード）</span>
            </Link>
            <div className="h-[2.75rem] w-full" aria-hidden />
          </div>

          <div className="flex min-w-0 flex-1 items-end justify-between gap-0.5 pl-0.5">
            {right.map((item) => (
              <NavPill key={item.href} item={item} pathname={pathname} />
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
