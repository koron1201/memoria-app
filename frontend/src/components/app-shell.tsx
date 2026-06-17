"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute =
    pathname === "/login" || pathname?.startsWith("/onboarding");
  const hideBottomNav = isAuthRoute || pathname === "/";

  return (
    <>
      <main
        className="flex-1"
        style={
          hideBottomNav
            ? undefined
            : {
                paddingBottom:
                  "calc(var(--nav-height) + var(--nav-float-inset) + env(safe-area-inset-bottom) + 1.25rem)",
              }
        }
      >
        {children}
      </main>
      {!hideBottomNav && <BottomNav />}
    </>
  );
}
