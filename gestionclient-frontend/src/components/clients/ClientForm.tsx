"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Mail, Phone, User, MapPin, FileText, UserCheck } from "lucide-react";

import { Button, Input } from "@/components/ui";
import { clientSchema, ClientFormSchema } from "@/lib/utils/schemas";
import { Client, StatutClient, AdminUser } from "@/types";
import { cn } from "@/lib/utils";
import { adminApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";

interface ClientFormProps {
  initialData?: Client;
  onSubmit: (data: ClientFormSchema) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const statuts: { value: StatutClient; label: string; color: string; bg: string }[] = [
  { value: "PROSPECT", label: "Prospect", color: "text-accent", bg: "bg-accent/10" },
  { value: "ACTIF", label: "Actif", color: "text-success", bg: "bg-success/10" },
  { value: "INACTIF", label: "Inactif", color: "text-text-muted", bg: "bg-text-muted/10" },
];

export default function ClientForm({ initialData, onSubmit, onCancel, loading }: ClientFormProps) {
  const { isAdmin } = useAuthStore();
  const [commerciaux, setCommerciaux] = useState<AdminUser[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ClientFormSchema>({
    resolver: zodResolver(clientSchema),
    defaultValues: initialData
      ? {
          nom: initialData.nom,
          prenom: initialData.prenom,
          email: initialData.email,
          telephone: initialData.telephone,
          entreprise: initialData.entreprise,
          statut: initialData.statut,
          adresse: initialData.adresse || "",
          notes: initialData.notes || "",
          assigneAId: initialData.assigneAId,
        }
      : { statut: "PROSPECT" },
  });

  useEffect(() => {
    if (!isAdmin) return;
    adminApi.getCommerciaux().then(setCommerciaux).catch(() => {});
  }, [isAdmin]);

  const currentStatut = watch("statut");
  const currentAssigneAId = watch("assigneAId");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Nom + Prénom */}
      <div className="grid grid-cols-2 gap-3">
        <Input label="Nom" placeholder="Dupont" icon={<User size={16} />} error={errors.nom?.message} {...register("nom")} />
        <Input label="Prénom" placeholder="Jean" icon={<User size={16} />} error={errors.prenom?.message} {...register("prenom")} />
      </div>

      {/* Email */}
      <Input label="Email" type="email" placeholder="jean.dupont@email.com" icon={<Mail size={16} />} autoComplete="email" error={errors.email?.message} {...register("email")} />

      {/* Téléphone + Entreprise */}
      <div className="grid grid-cols-2 gap-3">
        <Input label="Téléphone" placeholder="+33 6 12 34 56 78" icon={<Phone size={16} />} error={errors.telephone?.message} {...register("telephone")} />
        <Input label="Entreprise" placeholder="Acme Corp" icon={<Building2 size={16} />} error={errors.entreprise?.message} {...register("entreprise")} />
      </div>

      {/* Commercial assigné (Admin uniquement) */}
      {isAdmin && commerciaux.length > 0 && (
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-text-secondary">
            Commercial assigné
          </label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
              <UserCheck size={16} />
            </div>
            <select
              value={currentAssigneAId ?? ""}
              onChange={(e) =>
                setValue("assigneAId", e.target.value ? Number(e.target.value) : undefined)
              }
              className={cn(
                "w-full px-4 py-3 pl-11 rounded-xl text-sm text-text-primary",
                "bg-surface border border-glass-border appearance-none",
                "transition-all duration-200",
                "focus:border-primary/50 focus:shadow-[0_0_15px_rgba(108,99,255,0.15)] focus:outline-none",
              )}
            >
              <option value="">Non assigné</option>
              {commerciaux.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.prenom} {c.nom}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Statut */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-text-secondary">Statut</label>
        <div className="flex gap-2">
          {statuts.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setValue("statut", s.value)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border",
                currentStatut === s.value
                  ? `${s.bg} ${s.color} border-current`
                  : "bg-surface border-glass-border text-text-muted hover:text-text-secondary",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        {errors.statut && <p className="text-xs text-danger mt-1">{errors.statut.message}</p>}
      </div>

      {/* Adresse */}
      <Input label="Adresse (optionnel)" placeholder="123 Rue de Paris, 75001 Paris" icon={<MapPin size={16} />} {...register("adresse")} />

      {/* Notes */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-text-secondary">Notes (optionnel)</label>
        <div className="relative">
          <div className="absolute left-3.5 top-3 text-text-muted">
            <FileText size={16} />
          </div>
          <textarea
            placeholder="Notes sur ce client..."
            rows={3}
            className={cn(
              "w-full px-4 py-3 pl-11 rounded-xl text-sm text-text-primary placeholder-text-muted",
              "bg-surface border border-glass-border",
              "transition-all duration-200 resize-none",
              "focus:border-primary/50 focus:shadow-[0_0_15px_rgba(108,99,255,0.15)]",
              "hover:border-glass-border/80",
            )}
            {...register("notes")}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={loading} className="flex-1">
          {initialData ? "Enregistrer" : "Créer le client"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
