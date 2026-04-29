"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { RouteAtmosphere } from "@/components/route-atmosphere";
import { tanzakuApi } from "@/lib/api/tanzaku";

export default function RoadmapIndexPage() {
  const router = useRouter();

  useEffect(() => {
    tanzakuApi
      .list("active")
      .then(({ items }) => {
        if (items[0]) {
          router.replace(`/roadmap/${items[0].id}`);
          return;
        }
        return tanzakuApi.list();
      })
      .then((result) => {
        if (result?.items[0]) router.replace(`/roadmap/${result.items[0].id}`);
      })
      .catch(() => undefined);
  }, [router]);

  return (
    <>
      <RouteAtmosphere variant="wishes" />
      <div className="mx-auto flex min-h-screen w-full max-w-sm flex-col items-center justify-center px-5 text-center">
        <p className="text-sm text-muted-foreground">ロードマップを探しています</p>
        <Link
          href="/tanzaku"
          className="mt-4 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          新しい短冊を書く
        </Link>
      </div>
    </>
  );
}
