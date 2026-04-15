"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, LogOut, User, ChevronRight, Command } from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { cn, getInitials } from "@/lib/utils";

const breadcrumbMap: Record<string, string> = {
  dashboard: "Dashboard",
  clients: "Clients",
  taches: "Tâches",
  interactions: "Interactions",
  admin: "Administration",
  users: "Utilisateurs",
};

export default function Navbar() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  // Close menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Ctrl+K shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Generate breadcrumb
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((seg, i) => ({
    label: breadcrumbMap[seg] || seg,
    href: "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
  }));

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="h-16 border-b border-glass-border flex items-center justify-between px-6 bg-surface/50 backdrop-blur-md sticky top-0 z-30">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm">
        {breadcrumbs.map((crumb, i) => (
          <div key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={14} className="text-text-muted" />}
            <span
              className={cn(
                crumb.isLast
                  ? "text-text-primary font-medium"
                  : "text-text-muted",
              )}
            >
              {crumb.label}
            </span>
          </div>
        ))}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Search button */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-glass border border-glass-border text-text-muted hover:text-text-secondary text-sm transition-all hover:border-primary/20"
        >
          <Search size={14} />
          <span className="hidden md:inline">Rechercher...</span>
          <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-surface text-[10px] text-text-muted border border-glass-border">
            <Command size={10} />K
          </kbd>
        </button>

        {/* User menu */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-xl hover:bg-glass transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">
                {user ? getInitials(user.nom, user.prenom) : "??"}
              </span>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-text-primary leading-tight">
                {user?.prenom} {user?.nom}
              </p>
              <p className="text-[10px] text-text-muted uppercase tracking-wider">
                {user?.role}
              </p>
            </div>
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 5, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-56 glass-strong rounded-xl shadow-2xl overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-glass-border">
                  <p className="text-sm font-medium text-text-primary">
                    {user?.prenom} {user?.nom}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {user?.email}
                  </p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      router.push("/profil");
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-glass transition-all"
                  >
                    <User size={16} />
                    Mon profil
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-danger/5 transition-all"
                  >
                    <LogOut size={16} />
                    Déconnexion
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Search Modal Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4"
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setSearchOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97 }}
              className="relative w-full max-w-lg glass-strong rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center gap-3 px-5 py-4 border-b border-glass-border">
                <Search size={18} className="text-text-muted flex-shrink-0" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Rechercher un client, une tâche, une interaction..."
                  className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-muted outline-none"
                />
                <kbd className="px-2 py-0.5 rounded bg-surface text-[10px] text-text-muted border border-glass-border">
                  ESC
                </kbd>
              </div>
              <div className="px-5 py-8 text-center text-sm text-text-muted">
                Tapez pour rechercher...
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
