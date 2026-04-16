import { cn } from "@/lib/utils";

interface AvatarProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "size-16",
  md: "size-24",
  lg: "size-32",
};

export function Avatar({ size = "md", className }: AvatarProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full bg-gradient-to-br from-[#B8A9E8]/30 via-[#F2B5D4]/20 to-[#89CFF0]/30",
        sizeMap[size],
        className
      )}
    >
      <div
        className={cn(
          "absolute inset-1 rounded-full bg-gradient-to-br from-[#B8A9E8] via-[#F2B5D4] to-[#89CFF0] opacity-20 blur-md"
        )}
      />
      <svg
        viewBox="0 0 100 100"
        className={cn("relative z-10", {
          "size-10": size === "sm",
          "size-16": size === "md",
          "size-20": size === "lg",
        })}
      >
        <circle cx="50" cy="38" r="18" fill="#B8A9E8" />
        <circle cx="43" cy="34" r="2.5" fill="white" />
        <circle cx="57" cy="34" r="2.5" fill="white" />
        <path d="M45 42 Q50 47 55 42" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
        <ellipse cx="50" cy="72" rx="22" ry="18" fill="#B8A9E8" />
      </svg>
    </div>
  );
}
