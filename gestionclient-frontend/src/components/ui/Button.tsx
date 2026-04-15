"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "danger" | "ghost" | "accent";
type Size = "sm" | "md" | "lg";

interface ButtonProps {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-hover hover:shadow-[0_0_25px_rgba(108,99,255,0.4)] active:shadow-[0_0_15px_rgba(108,99,255,0.6)]",
  secondary:
    "bg-transparent border border-glass-border text-text-primary hover:bg-glass hover:border-primary/40",
  danger:
    "bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20 hover:shadow-[0_0_20px_rgba(255,82,82,0.2)]",
  ghost:
    "bg-transparent text-text-secondary hover:text-text-primary hover:bg-glass",
  accent:
    "bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.2)]",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
  md: "px-5 py-2.5 text-sm rounded-xl gap-2",
  lg: "px-7 py-3.5 text-base rounded-xl gap-2.5",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, icon, children, className, disabled, type = "button", onClick }, ref) => {
    return (
      <motion.button
        ref={ref}
        type={type}
        whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled || loading}
        onClick={onClick}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
export default Button;
