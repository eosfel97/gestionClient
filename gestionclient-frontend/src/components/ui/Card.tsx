"use client";

import { HTMLAttributes, forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "glass" | "solid" | "glow";
  hover?: boolean;
  padding?: "sm" | "md" | "lg";
}

const paddingStyles = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "glass", hover = false, padding = "md", className, children, ...props }, ref) => {
    const base = cn(
      "rounded-2xl transition-all duration-300",
      paddingStyles[padding],
      variant === "glass" && "glass",
      variant === "solid" && "bg-surface border border-glass-border",
      variant === "glow" && "glass glow-primary",
      hover && "hover:border-primary/20 hover:shadow-[0_0_30px_rgba(108,99,255,0.08)]",
      className
    );

    if (hover) {
      return (
        <motion.div
          ref={ref}
          whileHover={{ y: -2 }}
          className={base}
          {...(props as React.ComponentProps<typeof motion.div>)}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div ref={ref} className={base} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
export default Card;
