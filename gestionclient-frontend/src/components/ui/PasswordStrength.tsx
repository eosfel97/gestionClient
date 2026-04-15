"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface PasswordStrengthProps {
  password: string;
}

function getStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Faible", color: "bg-danger" };
  if (score <= 2) return { score, label: "Moyen", color: "bg-warning" };
  if (score <= 3) return { score, label: "Bon", color: "bg-accent" };
  return { score, label: "Excellent", color: "bg-success" };
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const strength = useMemo(() => getStrength(password), [password]);

  if (!password) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-all duration-300",
              i < strength.score ? strength.color : "bg-surface-light"
            )}
          />
        ))}
      </div>
      <p className={cn("text-xs", strength.score <= 1 ? "text-danger" : strength.score <= 2 ? "text-warning" : "text-success")}>
        {strength.label}
      </p>
    </div>
  );
}
