"use client";

import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  bg?: string;
  className?: string;
  size?: "sm" | "md";
}

export default function Badge({ children, color = "text-text-primary", bg = "bg-glass", className, size = "sm" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full",
        size === "sm" && "px-2.5 py-0.5 text-xs",
        size === "md" && "px-3 py-1 text-sm",
        color,
        bg,
        className
      )}
    >
      {children}
    </span>
  );
}
