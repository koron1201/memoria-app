"use client"

import {useEffect, useState} from "react";
import { useRouter } from "next/navigation";

const ONBOARDED_KEY = "app_onboarded";

export function useOnboarding() {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const hasOnboarded = localStorage.getItem(ONBOARDED_KEY) === "true";
        if (!hasOnboarded) {
            router.replace("/onboarding");
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsChecking(false);
    }, [router]);

    return { isChecking };
}