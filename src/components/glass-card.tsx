import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function GlassCard({ className, children, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/25 bg-white/15 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.06)] backdrop-blur-[20px]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
