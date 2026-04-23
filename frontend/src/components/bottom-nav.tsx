"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/",
    label: "ホーム",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
        <path d="M9 21V12h6v9" />
      </svg>
    ),
  },
  {
    href: "/upload",
    label: "記録",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    ),
  },
  {
    href: "/tanzaku",
    label: "短冊",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z" />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "マイページ",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  if (pathname?.startsWith("/onboarding")) {
    return null;
  }

  return (
    <nav
      aria-label="メインナビゲーション"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center pb-safe"
      style={{
        paddingLeft: "var(--nav-float-inset)",
        paddingRight: "var(--nav-float-inset)",
      }}
    >
      <div
        className="shadow-elev inset-highlight pointer-events-auto mb-3 flex w-full max-w-lg items-center justify-around gap-1 rounded-[var(--nav-float-radius)] border border-white/60 bg-white/75 px-2 py-1.5 backdrop-blur-xl"
      >
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname?.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl px-2 py-1.5 text-[11px] tracking-wide transition-all duration-200 ease-out",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground/70 hover:text-foreground",
              )}
            >
              {/* アクティブ時のピル背景 */}
              {isActive && (
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background:
                      "linear-gradient(180deg, color-mix(in oklab, var(--primary) 14%, transparent) 0%, color-mix(in oklab, var(--primary) 6%, transparent) 100%)",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.55), 0 4px 14px color-mix(in oklab, var(--primary) 18%, transparent)",
                  }}
                />
              )}
              <span
                className={cn(
                  "relative transition-transform duration-200",
                  isActive ? "scale-[1.04]" : "group-active:scale-95",
                )}
              >
                {item.icon}
              </span>
              <span className="relative font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
