"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/page-header";
import { SAMPLE_MEMORIES } from "@/lib/sample-memories";
import { cardStagger, pageTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";

export default function MemoryListPage() {
  return (
    <motion.div {...pageTransition}>
      <PageHeader title="思い出" />

      <div className="mx-auto w-full max-w-lg px-5 pt-4">
        <p className="text-center text-sm text-muted-foreground">
          記録した思い出（{SAMPLE_MEMORIES.length}件）
        </p>

        <motion.div
          className="mt-5 flex flex-col divide-y divide-foreground/8"
          initial="initial"
          animate="animate"
          variants={cardStagger.container}
        >
          {SAMPLE_MEMORIES.map((m) => (
            <motion.div key={m.id} className="py-3 first:pt-0" variants={cardStagger.item}>
              <Link href={`/memory/${m.id}`} className="group block">
                <div className="flex gap-3">
                  <div className="relative size-[4.5rem] shrink-0 overflow-hidden rounded-xl ring-1 ring-mono-ink/10">
                    <Image
                      src={m.imageUrl}
                      alt=""
                      fill
                      className="object-cover transition-transform group-hover:scale-[1.03]"
                      sizes="72px"
                    />
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <time className="text-[12px] font-medium tabular-nums text-muted-foreground">
                        {m.date}
                      </time>
                      <span className="text-sm font-semibold text-foreground">
                        {m.listTitle}
                      </span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      {m.meta != null && m.meta !== "" && (
                        <span className="text-[10px] tabular-nums text-muted-foreground/85">
                          {m.meta}
                        </span>
                      )}
                      {m.tags.map((t) => (
                        <span
                          key={t}
                          className={cn(
                            "inline-flex rounded-full border border-amber-900/14 bg-mono-cream/55 px-2 py-0.5 text-[10px] font-medium text-[#4a3f34]",
                          )}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                      {m.preview}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center self-center text-muted-foreground/40">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
