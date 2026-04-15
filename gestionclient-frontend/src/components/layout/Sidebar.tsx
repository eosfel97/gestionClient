"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  MessageSquare,
  Shield,
  ChevronLeft,
  Zap,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/taches", label: "Tâches", icon: CheckSquare },
  { href: "/interactions", label: "Interactions", icon: MessageSquare },
];

const adminItems = [
  { href: "/admin/users", label: "Utilisateurs", icon: Shield },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { isAdmin } = useAuthStore();

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ type: "spring", damping: 20, stiffness: 200 }}
      className="h-screen sticky top-0 flex flex-col bg-surface border-r border-glass-border z-40"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-glass-border">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Zap size={18} className="text-primary" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="font-bold text-text-primary whitespace-nowrap overflow-hidden"
            >
              GestionClient
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <p className={cn("text-[10px] uppercase tracking-widest text-text-muted mb-3", collapsed ? "text-center" : "px-3")}>
          {collapsed ? "•" : "Navigation"}
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-text-secondary hover:text-text-primary hover:bg-glass"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"
                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                  />
                )}
                <item.icon size={20} className={cn("flex-shrink-0", isActive && "drop-shadow-[0_0_6px_rgba(108,99,255,0.5)]")} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="text-sm font-medium whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}

        {/* Admin Section */}
        {isAdmin && (
          <>
            <div className="pt-4 pb-2">
              <p className={cn("text-[10px] uppercase tracking-widest text-text-muted", collapsed ? "text-center" : "px-3")}>
                {collapsed ? "•" : "Administration"}
              </p>
            </div>
            {adminItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ x: 2 }}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-text-secondary hover:text-text-primary hover:bg-glass"
                    )}
                  >
                    <item.icon size={20} className="flex-shrink-0" />
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          className="text-sm font-medium whitespace-nowrap overflow-hidden"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Collapse Toggle */}
      <div className="px-3 py-3 border-t border-glass-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-glass transition-all"
        >
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronLeft size={18} />
          </motion.div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs"
              >
                Réduire
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
