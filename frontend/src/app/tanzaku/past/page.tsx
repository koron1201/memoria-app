"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import { PageHeader } from "@/components/page-header";
import { GlassCard } from "@/components/glass-card";
import { pageTransition, cardStagger } from "@/lib/motion";
import { RouteAtmosphere } from "@/components/route-atmosphere";
import { tanzakuApi, type TanzakuWish } from "@/lib/api/tanzaku";
import { cn } from "@/lib/utils";

type Filter = "all" | "active" | "achieved";

function formatMonth(dateValue: string) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
  });
}

export default function PastTanzakuPage() {
  const [items, setItems] = useState<TanzakuWish[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    tanzakuApi
      .list()
      .then(({ items: fetched }) => {
        if (!ignore) setItems(fetched);
      })
      .catch(() => {
        if (!ignore) setError("短冊を読み込めませんでした。");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const filteredItems = useMemo(
    () =>
      items.filter((item) =>
        filter === "all" ? true : item.status === filter,
      ),
    [filter, items],
  );

  const achievedCount = items.filter((item) => item.status === "achieved").length;
  const activeCount = items.filter((item) => item.status === "active").length;

  return (
    <>
      <RouteAtmosphere variant="wishes" />
      <motion.div {...pageTransition}>
        <PageHeader title="過去の短冊" showBack />

        <div className="mx-auto w-full max-w-sm px-5 pb-10 pt-2">
          <p className="text-center text-sm text-muted-foreground">
            これまで送った願い（{items.length}枚）
          </p>

          <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl border border-white/50 bg-white/35 p-1 shadow-ambient">
            {[
              { value: "all", label: "すべて", count: items.length },
              { value: "active", label: "挑戦中", count: activeCount },
              { value: "achieved", label: "叶った", count: achievedCount },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value as Filter)}
                className={cn(
                  "rounded-xl px-2 py-2 text-xs font-medium transition-colors",
                  filter === option.value
                    ? "bg-mono-paper text-mono-ink shadow-sm"
                    : "text-muted-foreground hover:bg-white/45",
                )}
              >
                {option.label} {option.count}
              </button>
            ))}
          </div>

          {loading && (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              読み込んでいます
            </p>
          )}
          {error && (
            <p className="mt-6 rounded-2xl border border-red-200/70 bg-red-50/70 px-3 py-2 text-center text-xs leading-relaxed text-red-700">
              {error}
            </p>
          )}
          {!loading && filteredItems.length === 0 && (
            <p className="mt-6 rounded-2xl border border-white/55 bg-mono-paper/50 px-4 py-5 text-center text-sm text-muted-foreground">
              表示できる短冊はまだありません
            </p>
          )}

          <motion.div
            className="mt-5 flex flex-col gap-2.5"
            initial="initial"
            animate="animate"
            variants={cardStagger.container}
          >
            {filteredItems.map((item) => (
              <motion.div key={item.id} variants={cardStagger.item}>
                <Link href={`/tanzaku/past/${item.id}`} className="block">
                  <GlassCard className="bg-mono-paper/55 p-4 transition-transform hover:scale-[1.01]">
                    <div className="flex items-start justify-between gap-3">
                      <p className="min-w-0 text-sm font-medium leading-relaxed text-foreground">
                        {item.dream}
                      </p>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-1 text-[10px] font-medium",
                          item.status === "achieved"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700",
                        )}
                      >
                        {item.status === "achieved" ? "叶った" : "挑戦中"}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {formatMonth(item.createdAt)}
                    </p>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
