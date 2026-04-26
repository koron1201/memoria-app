"use client";

import dynamic from "next/dynamic";

const MoodAnimalScene = dynamic(
  () => import("./mood-animal-scene").then((m) => m.MoodAnimalScene),
  {
    ssr: false,
    loading: () => (
      <div className="relative flex h-72 w-72 items-center justify-center sm:h-80 sm:w-80">
        <div className="size-56 animate-pulse rounded-full bg-gradient-to-br from-mono-sage/35 via-mono-moss/30 to-mono-cream/45 blur-xl" />
      </div>
    ),
  },
);

interface MoodAnimalProps {
  src: string;
  accent?: string;
  className?: string;
  actionTick: number;
  onInteract?: () => void;
}

export function MoodAnimal({
  src,
  accent,
  className = "h-72 w-72 sm:h-80 sm:w-80",
  actionTick,
  onInteract,
}: MoodAnimalProps) {
  return (
    <MoodAnimalScene
      src={src}
      accent={accent}
      className={className}
      actionTick={actionTick}
      onInteract={onInteract}
    />
  );
}
