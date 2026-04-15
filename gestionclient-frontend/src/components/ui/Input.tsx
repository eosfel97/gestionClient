"use client";

import { InputHTMLAttributes, forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, type, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";

    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            type={isPassword && showPassword ? "text" : type}
            className={cn(
              "w-full px-4 py-3 rounded-xl text-sm text-text-primary placeholder-text-muted",
              "bg-surface border border-glass-border",
              "transition-all duration-200",
              "focus:border-primary/50 focus:shadow-[0_0_15px_rgba(108,99,255,0.15)]",
              "hover:border-glass-border/80",
              icon ? "pl-11" : undefined,
              isPassword ? "pr-11" : undefined,
              error ? "border-danger/50 focus:border-danger/50 focus:shadow-[0_0_15px_rgba(255,82,82,0.15)]" : undefined,
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>
        {error && (
          <p className="text-xs text-danger mt-1 pl-1">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
