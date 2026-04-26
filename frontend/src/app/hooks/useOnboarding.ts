"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const ONBOARDED_KEY = "app_onboarded";

export function useOnboarding() {
    const router = useRouter();

    useEffect(() => {
        const hasOnboarded = localStorage.getItem(ONBOARDED_KEY) === "true";
        if (!hasOnboarded) {
            router.replace("/onboarding");
        }
    }, [router]);
}