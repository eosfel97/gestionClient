import { StatutClient, StatutTache, PrioriteTache, TypeInteraction } from "@/types";

// ─── Date Formatting ───
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeDate(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} sem.`;
  return formatDate(dateStr);
}

export function isOverdue(dateStr: string): boolean {
  return new Date(dateStr) < new Date();
}

// ─── Status Styling ───
export const statutClientConfig: Record<StatutClient, { label: string; color: string; bg: string; glow: string }> = {
  ACTIF: { label: "Actif", color: "text-success", bg: "bg-success/10", glow: "glow-success" },
  PROSPECT: { label: "Prospect", color: "text-accent", bg: "bg-accent/10", glow: "glow-accent" },
  INACTIF: { label: "Inactif", color: "text-text-muted", bg: "bg-text-muted/10", glow: "" },
};

export const statutTacheConfig: Record<StatutTache, { label: string; color: string; bg: string }> = {
  A_FAIRE: { label: "À faire", color: "text-accent", bg: "bg-accent/10" },
  EN_COURS: { label: "En cours", color: "text-warning", bg: "bg-warning/10" },
  TERMINEE: { label: "Terminée", color: "text-success", bg: "bg-success/10" },
};

export const prioriteTacheConfig: Record<PrioriteTache, { label: string; color: string; bg: string }> = {
  HAUTE: { label: "Haute", color: "text-danger", bg: "bg-danger/10" },
  MOYENNE: { label: "Moyenne", color: "text-warning", bg: "bg-warning/10" },
  BASSE: { label: "Basse", color: "text-success", bg: "bg-success/10" },
};

export const typeInteractionConfig: Record<TypeInteraction, { label: string; icon: string; color: string; bg: string }> = {
  APPEL: { label: "Appel", icon: "Phone", color: "text-success", bg: "bg-success/10" },
  EMAIL: { label: "Email", icon: "Mail", color: "text-accent", bg: "bg-accent/10" },
  REUNION: { label: "Réunion", icon: "Users", color: "text-primary", bg: "bg-primary/10" },
  NOTE: { label: "Note", icon: "FileText", color: "text-warning", bg: "bg-warning/10" },
};

// ─── Initials Avatar ───
export function getInitials(nom: string, prenom: string): string {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
}

// ─── Number Animation Helper ───
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
