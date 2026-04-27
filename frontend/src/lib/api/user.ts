/**
 * User / Notification API stub.
 *
 * 現状は localStorage を読み書きするだけのスタブだが、
 * シグネチャ（Promise を返す純関数 + 型）はバック実装後にそのまま
 * fetch ラッパへ差し替えられる形にしてある。
 */

import { APP_LS, clearEntireClientAppState } from "@/lib/app-local-storage";

export interface UserProfile {
  displayName: string;
  email: string | null;
  joinedAt: string | null;
  /** 端末ローカルに保持する data URL（本番は URL or ID に差し替え） */
  avatarUrl: string | null;
}

export interface NotificationPrefs {
  push: boolean;
  email: boolean;
}

const PROFILE_KEY = APP_LS.profile;
const NOTIF_KEY = APP_LS.notifications;

export const defaultProfile: UserProfile = {
  displayName: "ゲストユーザー",
  email: null,
  joinedAt: null,
  avatarUrl: null,
};

export const defaultNotifications: NotificationPrefs = {
  push: false,
  email: true,
};

function safeRead<T extends object>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<T>;
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}

function safeWrite<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota / privacy mode などは握り潰す
  }
}

function normalizeProfile(raw: Partial<UserProfile> & Record<string, unknown>): UserProfile {
  return {
    displayName:
      typeof raw.displayName === "string" ? raw.displayName : defaultProfile.displayName,
    email: raw.email ?? null,
    joinedAt: raw.joinedAt ?? null,
    avatarUrl: typeof raw.avatarUrl === "string" ? raw.avatarUrl : null,
  };
}

function normalizeNotifications(
  raw: Partial<NotificationPrefs> & Record<string, unknown>,
): NotificationPrefs {
  return {
    push: typeof raw.push === "boolean" ? raw.push : defaultNotifications.push,
    email: typeof raw.email === "boolean" ? raw.email : defaultNotifications.email,
  };
}

const profileFallback = defaultProfile as UserProfile & Record<string, unknown>;
const notifFallback = defaultNotifications as NotificationPrefs & Record<string, unknown>;

export const userApi = {
  async getProfile(): Promise<UserProfile> {
    const merged = {
      ...defaultProfile,
      ...safeRead<UserProfile & Record<string, unknown>>(PROFILE_KEY, profileFallback),
    };
    return normalizeProfile(merged);
  },
  async updateProfile(patch: Partial<UserProfile>): Promise<UserProfile> {
    const next = normalizeProfile({
      ...defaultProfile,
      ...safeRead<UserProfile & Record<string, unknown>>(PROFILE_KEY, profileFallback),
      ...patch,
    });
    safeWrite(PROFILE_KEY, next);
    return next;
  },
  async getNotifications(): Promise<NotificationPrefs> {
    const merged = {
      ...defaultNotifications,
      ...safeRead<NotificationPrefs & Record<string, unknown>>(NOTIF_KEY, notifFallback),
    };
    return normalizeNotifications(merged);
  },
  async updateNotifications(
    patch: Partial<NotificationPrefs>,
  ): Promise<NotificationPrefs> {
    const next = normalizeNotifications({
      ...defaultNotifications,
      ...safeRead<NotificationPrefs & Record<string, unknown>>(NOTIF_KEY, notifFallback),
      ...patch,
    });
    safeWrite(NOTIF_KEY, next);
    return next;
  },
  clearLocalData(): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(PROFILE_KEY);
      window.localStorage.removeItem(NOTIF_KEY);
    } catch {
      // ignore
    }
  },
  /**
   * ログアウト用：オンボーディング完了フラグ・プロフィール・通知・アップロード一時データを消去
   */
  signOutClient(): void {
    clearEntireClientAppState();
  },
};
