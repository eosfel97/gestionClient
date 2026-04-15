"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Users,
  UserCheck,
  UserX,
  Trash2,
  ChevronDown,
  Search,
  Briefcase,
} from "lucide-react";
import toast from "react-hot-toast";

import { Button, Card, Badge, Modal } from "@/components/ui";
import AuthGuard from "@/components/layout/AuthGuard";
import { adminApi } from "@/lib/api";
import { AdminUser } from "@/types";
import { cn, formatDate, getInitials } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";

function AdminUsersContent() {
  const { user: currentUser } = useAuthStore();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");

  // Role dropdown
  const [roleDropdownId, setRoleDropdownId] = useState<number | null>(null);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Stats
  const totalUsers = users.length;
  const totalAdmins = users.filter((u) => u.role === "ADMIN").length;
  const totalCommerciaux = users.filter((u) => u.role === "COMMERCIAL").length;
  const totalActifs = users.filter((u) => u.actif).length;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Erreur chargement utilisateurs:", error);
      toast.error("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = () => setRoleDropdownId(null);
    if (roleDropdownId !== null) {
      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }
  }, [roleDropdownId]);

  // Filter users
  const filteredUsers = users.filter((u) => {
    if (!searchInput.trim()) return true;
    const q = searchInput.toLowerCase();
    return (
      u.nom.toLowerCase().includes(q) ||
      u.prenom.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  // Handlers
  const handleToggleActif = async (user: AdminUser) => {
    if (user.id === currentUser?.userId) {
      toast.error("Vous ne pouvez pas vous désactiver vous-même");
      return;
    }
    try {
      const updated = await adminApi.toggleActif(user.id);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
      toast.success(
        updated.actif ? `${user.prenom} activé` : `${user.prenom} désactivé`,
      );
    } catch {
      toast.error("Erreur lors du changement de statut");
    }
  };

  const handleChangeRole = async (
    user: AdminUser,
    newRole: "ADMIN" | "COMMERCIAL",
  ) => {
    if (user.id === currentUser?.userId) {
      toast.error("Vous ne pouvez pas changer votre propre rôle");
      return;
    }
    if (user.role === newRole) return;
    setRoleDropdownId(null);
    try {
      const updated = await adminApi.changeRole(user.id, newRole);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
      toast.success(`${user.prenom} est maintenant ${newRole}`);
    } catch {
      toast.error("Erreur lors du changement de rôle");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.id === currentUser?.userId) {
      toast.error("Vous ne pouvez pas supprimer votre propre compte");
      setDeleteTarget(null);
      return;
    }
    setDeleteLoading(true);
    try {
      await adminApi.deleteUser(deleteTarget.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      toast.success(`${deleteTarget.prenom} ${deleteTarget.nom} supprimé`);
      setDeleteTarget(null);
    } catch {
      toast.error("Erreur lors de la suppression");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6 ">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-text-primary">
          Gestion Utilisateurs
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Administration des comptes et rôles
        </p>
      </motion.div>

      {/* Stat Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {[
          {
            label: "Total",
            value: totalUsers,
            icon: Users,
            color: "text-primary",
            bg: "bg-primary/10",
          },
          {
            label: "Admins",
            value: totalAdmins,
            icon: Shield,
            color: "text-accent",
            bg: "bg-accent/10",
          },
          {
            label: "Commerciaux",
            value: totalCommerciaux,
            icon: Briefcase,
            color: "text-warning",
            bg: "bg-warning/10",
          },
          {
            label: "Actifs",
            value: totalActifs,
            icon: UserCheck,
            color: "text-success",
            bg: "bg-success/10",
          },
        ].map((stat, i) => (
          <Card
            key={stat.label}
            padding="sm"
            className="flex items-center gap-3"
          >
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                stat.bg,
              )}
            >
              <stat.icon size={18} className={stat.color} />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">
                {stat.value}
              </p>
              <p className="text-xs text-text-muted">{stat.label}</p>
            </div>
          </Card>
        ))}
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="relative max-w-md">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className={cn(
              "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-text-primary placeholder-text-muted",
              "bg-surface border border-glass-border",
              "focus:border-primary/50 focus:shadow-[0_0_15px_rgba(108,99,255,0.15)] focus:outline-none",
            )}
          />
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card padding="sm" className="overflow-hidden">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="skeleton h-16 rounded-xl"
                  style={{ animationDelay: `${i * 0.08}s` }}
                />
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-16 text-center">
              <Users size={32} className="text-text-muted mx-auto mb-3" />
              <p className="text-text-secondary">Aucun utilisateur trouvé</p>
            </div>
          ) : (
            <>
              {/* Header row */}
              <div className="grid grid-cols-[1fr_1fr_auto_auto_auto_auto] gap-4 px-5 py-3 border-b border-glass-border text-xs font-semibold text-text-muted uppercase tracking-wider">
                <span>Utilisateur</span>
                <span>Email</span>
                <span>Rôle</span>
                <span>Clients</span>
                <span>Statut</span>
                <span className="text-right">Actions</span>
              </div>

              {/* Rows */}
              <div className="divide-y divide-glass-border">
                <AnimatePresence mode="popLayout">
                  {filteredUsers.map((user, i) => {
                    const isSelf = user.id === currentUser?.userId;
                    return (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: i * 0.03 }}
                        className={cn(
                          "grid grid-cols-[1fr_1fr_auto_auto_auto_auto] gap-4 px-5 py-3.5 items-center group transition-colors",
                          isSelf ? "bg-primary/[0.02]" : "hover:bg-glass/50",
                        )}
                      >
                        {/* Name + avatar */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={cn(
                              "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                              user.role === "ADMIN"
                                ? "bg-accent/10"
                                : "bg-primary/10",
                            )}
                          >
                            <span
                              className={cn(
                                "text-xs font-bold",
                                user.role === "ADMIN"
                                  ? "text-accent"
                                  : "text-primary",
                              )}
                            >
                              {getInitials(user.nom, user.prenom)}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-text-primary truncate">
                              {user.prenom} {user.nom}
                              {isSelf && (
                                <span className="text-[10px] text-primary ml-2 font-normal">
                                  (vous)
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-text-muted">
                              Inscrit le {formatDate(user.dateCreation)}
                            </p>
                          </div>
                        </div>

                        {/* Email */}
                        <span className="text-sm text-text-secondary truncate">
                          {user.email}
                        </span>

                        {/* Role dropdown */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isSelf) return;
                              setRoleDropdownId(
                                roleDropdownId === user.id ? null : user.id,
                              );
                            }}
                            className={cn(
                              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                              user.role === "ADMIN"
                                ? "bg-accent/10 text-accent border-accent/20"
                                : "bg-warning/10 text-warning border-warning/20",
                              !isSelf && "hover:opacity-80 cursor-pointer",
                              isSelf && "opacity-60 cursor-default",
                            )}
                          >
                            {user.role === "ADMIN" ? (
                              <Shield size={12} />
                            ) : (
                              <Briefcase size={12} />
                            )}
                            {user.role}
                            {!isSelf && <ChevronDown size={10} />}
                          </button>

                          {/* Dropdown */}
                          <AnimatePresence>
                            {roleDropdownId === user.id && (
                              <motion.div
                                initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                transition={{ duration: 0.12 }}
                                className="absolute z-20 top-full mt-1 right-0 w-40 glass-strong rounded-xl shadow-2xl overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() =>
                                    handleChangeRole(user, "ADMIN")
                                  }
                                  className={cn(
                                    "w-full flex items-center gap-2 px-3 py-2.5 text-xs transition-all",
                                    user.role === "ADMIN"
                                      ? "text-accent bg-accent/5"
                                      : "text-text-secondary hover:text-accent hover:bg-accent/5",
                                  )}
                                >
                                  <Shield size={13} />
                                  Admin
                                  {user.role === "ADMIN" && (
                                    <span className="ml-auto text-[10px]">
                                      ✓
                                    </span>
                                  )}
                                </button>
                                <button
                                  onClick={() =>
                                    handleChangeRole(user, "COMMERCIAL")
                                  }
                                  className={cn(
                                    "w-full flex items-center gap-2 px-3 py-2.5 text-xs transition-all",
                                    user.role === "COMMERCIAL"
                                      ? "text-warning bg-warning/5"
                                      : "text-text-secondary hover:text-warning hover:bg-warning/5",
                                  )}
                                >
                                  <Briefcase size={13} />
                                  Commercial
                                  {user.role === "COMMERCIAL" && (
                                    <span className="ml-auto text-[10px]">
                                      ✓
                                    </span>
                                  )}
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Nombre clients */}
                        <div className="text-center">
                          <span className="text-sm font-semibold text-text-primary">
                            {user.nombreClients}
                          </span>
                          <p className="text-[10px] text-text-muted">clients</p>
                        </div>

                        {/* Statut toggle */}
                        <button
                          onClick={() => handleToggleActif(user)}
                          disabled={isSelf}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                            user.actif
                              ? "bg-success/10 text-success hover:bg-success/15"
                              : "bg-danger/10 text-danger hover:bg-danger/15",
                            isSelf &&
                              "opacity-60 cursor-default hover:bg-transparent",
                          )}
                        >
                          {user.actif ? (
                            <UserCheck size={13} />
                          ) : (
                            <UserX size={13} />
                          )}
                          {user.actif ? "Actif" : "Inactif"}
                        </button>

                        {/* Delete */}
                        <div className="flex justify-end">
                          <button
                            onClick={() => setDeleteTarget(user)}
                            disabled={isSelf}
                            className={cn(
                              "p-1.5 rounded-lg transition-all",
                              isSelf
                                ? "text-text-muted/30 cursor-default"
                                : "text-text-muted hover:text-danger hover:bg-danger/10 opacity-0 group-hover:opacity-100",
                            )}
                            title={
                              isSelf
                                ? "Vous ne pouvez pas vous supprimer"
                                : "Supprimer"
                            }
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </>
          )}
        </Card>
      </motion.div>

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Confirmer la suppression"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Êtes-vous sûr de vouloir supprimer le compte de{" "}
            <span className="font-semibold text-text-primary">
              {deleteTarget?.prenom} {deleteTarget?.nom}
            </span>{" "}
            ?
          </p>
          {deleteTarget && deleteTarget.nombreClients > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-warning/5 border border-warning/20">
              <span className="text-xs text-warning">
                ⚠ Cet utilisateur a {deleteTarget.nombreClients} client
                {deleteTarget.nombreClients > 1 ? "s" : ""} assigné
                {deleteTarget.nombreClients > 1 ? "s" : ""}
              </span>
            </div>
          )}
          <div className="flex gap-3">
            <Button
              variant="danger"
              loading={deleteLoading}
              onClick={handleDelete}
              className="flex-1"
            >
              Supprimer
            </Button>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              Annuler
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <AuthGuard requiredRole="ADMIN">
      <AdminUsersContent />
    </AuthGuard>
  );
}
