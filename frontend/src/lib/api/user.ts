/**
 * User / Notification API stub.
 *
 * 現状は localStorage を読み書きするだけのスタブだが、
 * シグネチャ（Promise を返す純関数 + 型）はバック実装後にそのまま
 * fetch ラッパへ差し替えられる形にしてある。
 */

import { APP_LS, clearEntireClientAppState } from "@/lib/app-local-storage";
// 🌟 修正点1: Supabaseクライアントをインポートする
import { supabase } from "@/lib/supabase";

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
    // 🌟 修正点2: まずローカルのデータを読み込む
    const localData = safeRead<UserProfile & Record<string, unknown>>(PROFILE_KEY, profileFallback);

    // 🌟 修正点3: Supabaseからログイン中のユーザー情報を取得する
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // ログイン済みの場合：Googleの情報とローカル情報をうまくミックスする
      const isDefaultName = !localData.displayName || localData.displayName === defaultProfile.displayName;

      return normalizeProfile({
        // プロフィール編集で名前を変えていなければ、Googleアカウントの名前を使う
        displayName: isDefaultName ? (user.user_metadata?.full_name || "ユーザー") : localData.displayName,
        // Googleのメールアドレスを表示
        email: user.email || null,
        // アカウント作成日を表示（yyyy/mm/dd の形式などに変換）
        joinedAt: user.created_at ? new Date(user.created_at).toLocaleDateString("ja-JP") : null,
        // 自分で画像をアップロードしていなければ、Googleのアイコンを使う
        avatarUrl: localData.avatarUrl || user.user_metadata?.avatar_url || null,
      });
    }

    // 未ログイン（ゲストユーザー）の場合
    const merged = { ...defaultProfile, ...localData };
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
   * 🌟 修正点4: ログアウト時にSupabase側も確実にサインアウトさせる
   */
  async signOutClient(): Promise<void> {
    await supabase.auth.signOut();
    clearEntireClientAppState();
  },
};