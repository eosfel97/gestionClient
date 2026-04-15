"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui";
import AnimatedCounter from "./AnimatedCounter";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: "primary" | "accent" | "success" | "warning" | "danger";
  subtitle?: string;
  delay?: number;
}

const colorMap = {
  primary: {
    icon: "text-primary bg-primary/10",
    glow: "group-hover:shadow-[0_0_25px_rgba(108,99,255,0.15)]",
    text: "text-primary",
  },
  accent: {
    icon: "text-accent bg-accent/10",
    glow: "group-hover:shadow-[0_0_25px_rgba(0,212,255,0.15)]",
    text: "text-accent",
  },
  success: {
    icon: "text-success bg-success/10",
    glow: "group-hover:shadow-[0_0_25px_rgba(0,230,118,0.15)]",
    text: "text-success",
  },
  warning: {
    icon: "text-warning bg-warning/10",
    glow: "group-hover:shadow-[0_0_25px_rgba(255,179,0,0.15)]",
    text: "text-warning",
  },
  danger: {
    icon: "text-danger bg-danger/10",
    glow: "group-hover:shadow-[0_0_25px_rgba(255,82,82,0.15)]",
    text: "text-danger",
  },
};

export default function StatCard({ title, value, icon: Icon, color, subtitle, delay = 0 }: StatCardProps) {
  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
    >
      <Card hover className={cn("group transition-all duration-300", colors.glow)}>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-text-secondary font-medium">{title}</p>
            <p className={cn("text-3xl font-bold", colors.text)}>
              <AnimatedCounter value={value} />
            </p>
            {subtitle && (
              <p className="text-xs text-text-muted">{subtitle}</p>
            )}
          </div>
          <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", colors.icon)}>
            <Icon size={22} />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
