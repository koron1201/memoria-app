"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/page-header";
import { GlassCard } from "@/components/glass-card";
import { pageTransition, cardStagger } from "@/lib/motion";
import { RouteAtmosphere } from "@/components/route-atmosphere";
import { PAST_TANZAKU_ITEMS } from "@/lib/past-tanzaku";

export default function PastTanzakuPage() {
  return (
    <>
      <RouteAtmosphere variant="wishes" />
      <motion.div {...pageTransition}>
        <PageHeader title="過去の短冊" showBack />

        <div className="mx-auto w-full max-w-sm px-5 pb-10 pt-2">
          <p className="text-center text-sm text-muted-foreground">
            これまで送った願い（{PAST_TANZAKU_ITEMS.length}枚）
          </p>
          <motion.div
            className="mt-5 flex flex-col gap-2.5"
            initial="initial"
            animate="animate"
            variants={cardStagger.container}
          >
            {PAST_TANZAKU_ITEMS.map((item) => (
              <motion.div key={item.id} variants={cardStagger.item}>
                <Link href={`/roadmap/${item.id}`} className="block">
                  <GlassCard className="bg-mono-paper/55 p-4 transition-transform hover:scale-[1.01]">
                    <p className="text-sm font-medium leading-relaxed text-foreground">
                      {item.text}
                    </p>
                    <p className="mt-1.5 text-xs text-muted-foreground">{item.date}</p>
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
