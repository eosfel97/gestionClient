"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  lines?: number;
}

export default function Skeleton({ className, lines }: SkeletonProps) {
  if (lines) {
    return (
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn("skeleton h-4", i === lines - 1 && "w-3/4")}
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    );
  }

  return <div className={cn("skeleton", className)} />;
}

export function SkeletonCard() {
  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="skeleton w-10 h-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <div className="skeleton h-4 w-1/3" />
          <div className="skeleton h-3 w-1/2" />
        </div>
      </div>
      <Skeleton lines={3} />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <div className="skeleton h-10 rounded-xl" />
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="skeleton h-14 rounded-xl"
          style={{ animationDelay: `${i * 0.08}s` }}
        />
      ))}
    </div>
  );
}
