"use client";

import { useCallback, useEffect, useState } from "react";
import {
  defaultNotifications,
  defaultProfile,
  userApi,
  type NotificationPrefs,
  type UserProfile,
} from "@/lib/api/user";

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [notifications, setNotifications] =
    useState<NotificationPrefs>(defaultNotifications);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([userApi.getProfile(), userApi.getNotifications()]).then(
      ([p, n]) => {
        if (cancelled) return;
        setProfile(p);
        setNotifications(n);
        setHydrated(true);
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const updateProfile = useCallback(async (patch: Partial<UserProfile>) => {
    const next = await userApi.updateProfile(patch);
    setProfile(next);
  }, []);

  const updateNotifications = useCallback(
    async (patch: Partial<NotificationPrefs>) => {
      const next = await userApi.updateNotifications(patch);
      setNotifications(next);
    },
    [],
  );

  const clearLocal = useCallback(async () => {
    userApi.clearLocalData();
    const [p, n] = await Promise.all([
      userApi.getProfile(),
      userApi.getNotifications(),
    ]);
    setProfile(p);
    setNotifications(n);
  }, []);

  const logOut = useCallback(() => {
    userApi.signOutClient();
    setProfile(defaultProfile);
    setNotifications(defaultNotifications);
  }, []);

  return {
    profile,
    notifications,
    hydrated,
    updateProfile,
    updateNotifications,
    clearLocal,
    logOut,
  };
}
