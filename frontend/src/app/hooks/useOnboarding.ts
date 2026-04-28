"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ONBOARDED_KEY } from "@/lib/app-local-storage";

export function useOnboarding() {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const hasOnboarded = localStorage.getItem(ONBOARDED_KEY) === "true";
        if (!hasOnboarded) {
            // 【修正】未登録なら、まずはスライド画面へ飛ばす
            router.replace("/onboarding");
        } else {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsChecking(false);
        }
    }, [router]);

    return { isChecking };
}