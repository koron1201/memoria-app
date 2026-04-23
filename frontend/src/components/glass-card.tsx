import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function GlassCard({ className, children, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "shadow-soft rounded-2xl border border-white/25 bg-white/15 p-5 backdrop-blur-[20px]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
