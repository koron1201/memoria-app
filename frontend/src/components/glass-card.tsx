import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function GlassCard({ className, children, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "shadow-soft rounded-[1.35rem] border border-white/35 bg-mono-paper/50 p-5 backdrop-blur-[20px] backdrop-saturate-[1.06]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
