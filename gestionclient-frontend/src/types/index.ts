// ─── Auth ───
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  role: "ADMIN" | "COMMERCIAL";
}

export interface AuthResponse {
  token: string;
  userId: number;
  nom: string;
  prenom: string;
  email: string;
  role: "ADMIN" | "COMMERCIAL";
}

export interface User {
  userId: number;
  nom: string;
  prenom: string;
  email: string;
  role: "ADMIN" | "COMMERCIAL";
}

// ─── Pagination ───
export interface PaginatedResponse<T> {
  contenu: T[];
  pageActuelle: number;
  taillePage: number;
  totalElements: number;
  totalPages: number;
  premiere: boolean;
  derniere: boolean;
}

// ─── Clients ───
export type StatutClient = "PROSPECT" | "ACTIF" | "INACTIF";

export interface Client {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  entreprise: string;
  statut: StatutClient;
  adresse?: string;
  notes?: string;
  dateCreation: string;
  dateModification: string;
}

export interface ClientFormData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  entreprise: string;
  statut: StatutClient;
  adresse?: string;
  notes?: string;
}

// ─── Interactions ───
export type TypeInteraction = "APPEL" | "EMAIL" | "REUNION" | "NOTE";

export interface Interaction {
  id: number;
  type: TypeInteraction;
  sujet: string;
  contenu: string;
  dateInteraction: string;
  clientId: number;
  clientNom?: string;
  clientPrenom?: string;
  clientEntreprise?: string;
  auteurId: number;
  auteurNom?: string;
  auteurPrenom?: string;
}

export interface InteractionFormData {
  type: TypeInteraction;
  sujet: string;
  contenu: string;
  clientId: number;
}

// ─── Tâches ───
export type StatutTache = "A_FAIRE" | "EN_COURS" | "TERMINEE";
export type PrioriteTache = "HAUTE" | "MOYENNE" | "BASSE";

export interface Tache {
  id: number;
  titre: string;
  description: string;
  statut: StatutTache;
  priorite: PrioriteTache;
  dateEcheance: string;
  clientId: number;
  clientNom?: string;
  clientPrenom?: string;
  utilisateurId: number;
  utilisateurNom?: string;
  dateCreation: string;
  dateModification: string;
}

export interface TacheFormData {
  titre: string;
  description: string;
  statut: StatutTache;
  priorite: PrioriteTache;
  dateEcheance: string;
  clientId: number;
}

// ─── Dashboard ───
export interface DashboardStats {
  totalClients: number;
  clientsActifs: number;
  clientsProspects: number;
  clientsInactifs: number;
  totalTaches: number;
  tachesAFaire: number;
  tachesEnCours: number;
  tachesTerminees: number;
  tachesEnRetard: number;
  totalInteractions: number;
  interactionsCeMois: number;
  interactionsCetteSemaine: number;
  interactionsParType: Record<TypeInteraction, number>;
  tachesParPriorite: Record<PrioriteTache, number>;
  dernieresInteractions: Interaction[];
  prochainesTaches: Tache[];
  tachesEnRetardListe: Tache[];
}

// ─── Admin ───
export interface AdminUser {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: "ADMIN" | "COMMERCIAL";
  actif: boolean;
  dateCreation: string;
  nombreClients: number;
}
