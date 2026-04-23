import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const registerSchema = z.object({
  nom: z.string().min(2, "Minimum 2 caractères"),
  prenom: z.string().min(2, "Minimum 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Minimum 8 caractères"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export const clientSchema = z.object({
  nom: z.string().min(2, "Minimum 2 caractères"),
  prenom: z.string().min(2, "Minimum 2 caractères"),
  email: z.string().email("Email invalide"),
  telephone: z.string().min(8, "Numéro invalide"),
  entreprise: z.string().min(1, "Entreprise requise"),
  statut: z.enum(["PROSPECT", "ACTIF", "INACTIF"]),
  adresse: z.string().optional(),
  notes: z.string().optional(),
  assigneAId: z.number().optional(),
});

export const interactionSchema = z.object({
  type: z.enum(["APPEL", "EMAIL", "REUNION", "NOTE"]),
  date: z.string().min(1, "Date requise"),
  notes: z.string().min(1, "Notes requises"),
  clientId: z.number().min(1, "Client requis"),
});

export const tacheSchema = z.object({
  titre: z.string().min(2, "Minimum 2 caractères"),
  description: z.string().min(1, "Description requise"),
  statut: z.enum(["A_FAIRE", "EN_COURS", "TERMINEE"]),
  priorite: z.enum(["HAUTE", "MOYENNE", "BASSE"]),
  dateEcheance: z.string().min(1, "Date requise"),
  clientId: z.number().min(1, "Client requis"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ClientFormSchema = z.infer<typeof clientSchema>;
export type InteractionFormSchema = z.infer<typeof interactionSchema>;
export type TacheFormSchema = z.infer<typeof tacheSchema>;
