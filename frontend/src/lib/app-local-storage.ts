/**
 * この端末の localStorage キー（オンボーディング・プロフィール・一時アップロード等）
 */
export const APP_LS = {
  onboarded: "app_onboarded",
  profile: "memoria.profile.v1",
  notifications: "memoria.notifications.v1",
  lastAnalysis: "last_analysis",
  lastImage: "last_image",
} as const;

export const ONBOARDED_KEY = APP_LS.onboarded;

export function clearEntireClientAppState(): void {
  if (typeof window === "undefined") return;
  try {
    (Object.values(APP_LS) as string[]).forEach((k) => {
      window.localStorage.removeItem(k);
    });
  } catch {
    // quota / プライベートモード等
  }
}
