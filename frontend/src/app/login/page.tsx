"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { transitions } from "@/lib/motion";
import { supabase } from "@/lib/supabase";
import { ONBOARDED_KEY } from "@/lib/app-local-storage";
import { useRouter } from "next/navigation";

export default function WelcomePage() {
    const router = useRouter();

    const handleGoogleLogin = async () => {
        // 【修正1】Googleの画面にリダイレクトされる「前」に保存する
        localStorage.setItem(ONBOARDED_KEY, "true");

        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                // 【修正2】Next.jsのSSRエラーを防ぐための安全な書き方
                redirectTo: typeof window !== "undefined" ? `${window.location.origin}/` : "/",
            },
        });
    };

    const handleGuest = () => {
        localStorage.setItem(ONBOARDED_KEY, "true");
        router.push("/");
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transitions.gentle}
            className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-8"
        >
            <Image
                src="/login-assets/04_background_blobs.png"
                alt=""
                width={400}
                height={400}
                priority
                className="pointer-events-none absolute left-1/2 top-1/2 w-[38rem] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-35 blur-[1px]"
            />
            <Image
                src="/login-assets/05_wave_texture.png"
                alt=""
                width={400}
                height={100}
                className="pointer-events-none absolute inset-x-0 top-0 h-28 w-full object-cover opacity-45"
            />
            <Image
                src="/login-assets/06_sparkles.png"
                alt=""
                width={200}
                height={200}
                className="pointer-events-none absolute right-[max(1.5rem,calc(50%-18rem))] top-[12vh] w-28 opacity-65"
            />
            <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(72%_52%_at_50%_6%,rgba(255,255,255,0.76),transparent_68%),linear-gradient(180deg,rgba(255,252,247,0.42),rgba(255,255,255,0.16))]"
                aria-hidden
            />
            <div className="relative w-full max-w-sm">
                <div className="rounded-[1.75rem] border border-white/65 bg-mono-paper/78 px-5 pb-5 pt-6 text-center shadow-elev backdrop-blur-[24px]">
                    <div className="mx-auto grid size-20 place-content-center rounded-full border border-white/70 bg-white/45 shadow-soft">
                        <Image
                            src="/login-assets/01_app_icon.png"
                            alt=""
                            width={68}
                            height={68}
                            priority
                            className="rounded-full"
                        />
                    </div>

                    <div className="mt-5">
                        <p className="text-[11px] font-semibold tracking-[0.32em] text-primary/80">
                            MEMORIA
                        </p>
                        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                            はじめましょう
                        </h1>
                        <p className="mx-auto mt-2 max-w-[17rem] text-sm leading-relaxed text-muted-foreground">
                            思い出を物語にして、いつでも見返せる場所へ。
                        </p>
                    </div>

                    <div className="relative mx-auto my-5 h-5 w-44">
                        <Image
                            src="/login-assets/11_diamond_divider.png"
                            alt=""
                            fill
                            sizes="11rem"
                            className="object-contain opacity-70"
                        />
                    </div>

                    <p className="mb-3 text-xs text-muted-foreground">
                        アカウントを作ると思い出をどこでも見られます
                    </p>
                    <div className="flex w-full flex-col gap-3">
                    <Button
                        onClick={handleGoogleLogin}
                        variant="outline"
                        className="h-12 w-full gap-2 rounded-2xl border-white/75 bg-white/82 text-sm font-semibold shadow-ambient hover:bg-white"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Googleでログイン
                    </Button>

                    <Button
                        onClick={handleGuest}
                        variant="ghost"
                        className="h-12 w-full rounded-2xl text-sm font-medium text-muted-foreground hover:bg-white/45 hover:text-foreground"
                    >
                        ゲストとして使う
                    </Button>
                    </div>
                </div>

                <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground/75">
                    写真とひとことから、今日の気持ちを静かに残します。
                </p>
            </div>
        </motion.div>
    );
}
