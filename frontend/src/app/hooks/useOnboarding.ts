"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ONBOARDED_KEY } from "@/lib/app-local-storage";
import { supabase } from "@/lib/supabase";

export function useOnboarding() {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const hasOnboarded = localStorage.getItem(ONBOARDED_KEY) === "true";
        if (!hasOnboarded) {
            router.replace("/login"); // 未オンボーディングならログイン画面へ
        } else {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsChecking(false);
        }
    }, [router]);

    const handleGoogleLogin = async () => {
        // 【修正1】Googleの画面にリダイレクトされる「前」に保存する
        localStorage.setItem(ONBOARDED_KEY, "true");

        // ログイン処理を開始
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                // 【修正2】Next.jsのSSRエラーを防ぐための安全な書き方
                redirectTo: typeof window !== "undefined" ? `${window.location.origin}/` : "/",
            },
        });
    };

    return { isChecking, handleGoogleLogin };
}