"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Shield,
  Briefcase,
  Calendar,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";
import toast from "react-hot-toast";

import { Button, Card, Badge } from "@/components/ui";
import {
  profilApi,
  ProfilUpdateData,
  ChangePasswordData,
} from "@/lib/api/profil";
import { useAuthStore } from "@/stores/auth";
import { AdminUser } from "@/types";
import { cn, formatDate, getInitials } from "@/lib/utils";

export default function ProfilPage() {
  const { user: authUser, login: authLogin } = useAuthStore();
  const [profil, setProfil] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Info form
  const [infoForm, setInfoForm] = useState({ nom: "", prenom: "", email: "" });
  const [infoLoading, setInfoLoading] = useState(false);

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    ancienPassword: "",
    nouveauPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showAncien, setShowAncien] = useState(false);
  const [showNouveau, setShowNouveau] = useState(false);

  useEffect(() => {
    const fetchProfil = async () => {
      try {
        const data = await profilApi.get();
        setProfil(data);
        setInfoForm({ nom: data.nom, prenom: data.prenom, email: data.email });
      } catch {
        toast.error("Erreur lors du chargement du profil");
      } finally {
        setLoading(false);
      }
    };
    fetchProfil();
  }, []);

  const handleInfoSubmit = async () => {
    if (
      !infoForm.nom.trim() ||
      !infoForm.prenom.trim() ||
      !infoForm.email.trim()
    ) {
      toast.error("Tous les champs sont obligatoires");
      return;
    }
    setInfoLoading(true);
    try {
      const updated = await profilApi.update(infoForm);
      setProfil(updated);

      // Mettre à jour le store auth + localStorage
      if (authUser) {
        const token = localStorage.getItem("token");
        if (token) {
          authLogin(token, {
            userId: authUser.userId,
            nom: updated.nom,
            prenom: updated.prenom,
            email: updated.email,
            role: authUser.role,
          });
        }
      }

      toast.success("Profil mis à jour");
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } };
      if (err.response?.status === 409) {
        toast.error("Cet email est déjà utilisé");
      } else {
        toast.error("Erreur lors de la mise à jour");
      }
    } finally {
      setInfoLoading(false);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!passwordForm.ancienPassword || !passwordForm.nouveauPassword) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    if (passwordForm.nouveauPassword.length < 6) {
      toast.error(
        "Le nouveau mot de passe doit contenir au moins 6 caractères",
      );
      return;
    }
    if (passwordForm.nouveauPassword !== passwordForm.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    setPasswordLoading(true);
    try {
      await profilApi.changePassword({
        ancienPassword: passwordForm.ancienPassword,
        nouveauPassword: passwordForm.nouveauPassword,
      });
      toast.success("Mot de passe modifié avec succès");
      setPasswordForm({
        ancienPassword: "",
        nouveauPassword: "",
        confirmPassword: "",
      });
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } };
      if (err.response?.status === 400) {
        toast.error("L'ancien mot de passe est incorrect");
      } else {
        toast.error("Erreur lors du changement de mot de passe");
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div className="skeleton h-10 w-48" />
        <div className="skeleton h-64 rounded-2xl" />
        <div className="skeleton h-48 rounded-2xl" />
      </div>
    );
  }

  if (!profil) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-text-primary">Mon Profil</h1>
        <p className="text-sm text-text-secondary mt-1">
          Gérez vos informations personnelles
        </p>
      </motion.div>

      {/* Profile card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-primary/15 flex items-center justify-center glow-primary">
            <span className="text-2xl font-bold text-primary">
              {getInitials(profil.nom, profil.prenom)}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-text-primary">
              {profil.prenom} {profil.nom}
            </h2>
            <p className="text-sm text-text-secondary mt-0.5">{profil.email}</p>
            <div className="flex items-center gap-3 mt-2">
              <Badge
                color={profil.role === "ADMIN" ? "text-accent" : "text-warning"}
                bg={profil.role === "ADMIN" ? "bg-accent/10" : "bg-warning/10"}
                size="md"
              >
                {profil.role === "ADMIN" ? (
                  <Shield size={12} className="mr-1" />
                ) : (
                  <Briefcase size={12} className="mr-1" />
                )}
                {profil.role}
              </Badge>
              <span className="text-xs text-text-muted flex items-center gap-1">
                <Calendar size={12} />
                Inscrit le {formatDate(profil.dateCreation)}
              </span>
              <span className="text-xs text-text-muted">
                {profil.nombreClients} client
                {profil.nombreClients > 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Edit Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <h3 className="text-base font-semibold text-text-primary mb-5 flex items-center gap-2">
            <User size={18} className="text-primary" />
            Informations personnelles
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-text-secondary">
                  Nom
                </label>
                <input
                  type="text"
                  value={infoForm.nom}
                  onChange={(e) =>
                    setInfoForm((p) => ({ ...p, nom: e.target.value }))
                  }
                  className={cn(
                    "w-full px-4 py-3 rounded-xl text-sm text-text-primary",
                    "bg-surface border border-glass-border",
                    "focus:border-primary/50 focus:shadow-[0_0_15px_rgba(108,99,255,0.15)] focus:outline-none",
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-text-secondary">
                  Prénom
                </label>
                <input
                  type="text"
                  value={infoForm.prenom}
                  onChange={(e) =>
                    setInfoForm((p) => ({ ...p, prenom: e.target.value }))
                  }
                  className={cn(
                    "w-full px-4 py-3 rounded-xl text-sm text-text-primary",
                    "bg-surface border border-glass-border",
                    "focus:border-primary/50 focus:shadow-[0_0_15px_rgba(108,99,255,0.15)] focus:outline-none",
                  )}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-secondary">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                  type="email"
                  value={infoForm.email}
                  onChange={(e) =>
                    setInfoForm((p) => ({ ...p, email: e.target.value }))
                  }
                  className={cn(
                    "w-full pl-10 pr-4 py-3 rounded-xl text-sm text-text-primary",
                    "bg-surface border border-glass-border",
                    "focus:border-primary/50 focus:shadow-[0_0_15px_rgba(108,99,255,0.15)] focus:outline-none",
                  )}
                />
              </div>
            </div>

            <Button
              loading={infoLoading}
              onClick={handleInfoSubmit}
              icon={<Save size={15} />}
            >
              Enregistrer les modifications
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Change Password */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card>
          <h3 className="text-base font-semibold text-text-primary mb-5 flex items-center gap-2">
            <Lock size={18} className="text-warning" />
            Changer le mot de passe
          </h3>

          <div className="space-y-4">
            {/* Ancien */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-secondary">
                Mot de passe actuel
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                  type={showAncien ? "text" : "password"}
                  value={passwordForm.ancienPassword}
                  onChange={(e) =>
                    setPasswordForm((p) => ({
                      ...p,
                      ancienPassword: e.target.value,
                    }))
                  }
                  placeholder="Votre mot de passe actuel"
                  autoComplete="current-password"
                  className={cn(
                    "w-full pl-10 pr-10 py-3 rounded-xl text-sm text-text-primary placeholder-text-muted",
                    "bg-surface border border-glass-border",
                    "focus:border-primary/50 focus:shadow-[0_0_15px_rgba(108,99,255,0.15)] focus:outline-none",
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowAncien(!showAncien)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                >
                  {showAncien ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Nouveau */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-secondary">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                  type={showNouveau ? "text" : "password"}
                  value={passwordForm.nouveauPassword}
                  onChange={(e) =>
                    setPasswordForm((p) => ({
                      ...p,
                      nouveauPassword: e.target.value,
                    }))
                  }
                  placeholder="Minimum 6 caractères"
                  autoComplete="new-password"
                  className={cn(
                    "w-full pl-10 pr-10 py-3 rounded-xl text-sm text-text-primary placeholder-text-muted",
                    "bg-surface border border-glass-border",
                    "focus:border-primary/50 focus:shadow-[0_0_15px_rgba(108,99,255,0.15)] focus:outline-none",
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowNouveau(!showNouveau)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                >
                  {showNouveau ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirmation */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-secondary">
                Confirmer le nouveau mot de passe
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((p) => ({
                      ...p,
                      confirmPassword: e.target.value,
                    }))
                  }
                  placeholder="Retapez le nouveau mot de passe"
                  autoComplete="new-password"
                  className={cn(
                    "w-full pl-10 py-3 rounded-xl text-sm text-text-primary placeholder-text-muted",
                    "bg-surface border border-glass-border",
                    "focus:border-primary/50 focus:shadow-[0_0_15px_rgba(108,99,255,0.15)] focus:outline-none",
                    passwordForm.confirmPassword &&
                      passwordForm.confirmPassword !==
                        passwordForm.nouveauPassword
                      ? "border-danger/50"
                      : "",
                  )}
                />
              </div>
              {passwordForm.confirmPassword &&
                passwordForm.confirmPassword !==
                  passwordForm.nouveauPassword && (
                  <p className="text-xs text-danger">
                    Les mots de passe ne correspondent pas
                  </p>
                )}
            </div>

            <Button
              loading={passwordLoading}
              onClick={handlePasswordSubmit}
              variant="secondary"
              icon={<Lock size={15} />}
              disabled={
                !passwordForm.ancienPassword ||
                !passwordForm.nouveauPassword ||
                passwordForm.nouveauPassword !== passwordForm.confirmPassword
              }
            >
              Changer le mot de passe
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
