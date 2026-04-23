import { create } from "zustand";
import { User } from "@/types";
import api from "@/lib/api/axios";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  hydrated: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  hydrated: false,

  login: (user: User) => {
    localStorage.setItem("user", JSON.stringify(user));
    set({ user, isAuthenticated: true, isAdmin: user.role === "ADMIN", hydrated: true });
  },

  logout: async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {
      // Le cookie sera supprimé même si la requête échoue côté réseau
    }
    localStorage.removeItem("user");
    set({ user: null, isAuthenticated: false, isAdmin: false, hydrated: false });
  },

  hydrate: async () => {
    if (get().hydrated) return;

    // Pré-remplissage rapide depuis localStorage pour éviter le flash
    const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (userStr) {
      try {
        const cached: User = JSON.parse(userStr);
        set({ user: cached, isAuthenticated: true, isAdmin: cached.role === "ADMIN" });
      } catch {
        localStorage.removeItem("user");
      }
    }

    // Vérification réelle auprès du backend (détecte token expiré + rôle réel)
    try {
      const response = await api.get("/api/profil");
      const data = response.data;
      const user: User = {
        userId: data.id ?? data.userId,
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        role: data.role,
      };
      localStorage.setItem("user", JSON.stringify(user));
      set({ user, isAuthenticated: true, isAdmin: user.role === "ADMIN", hydrated: true });
    } catch {
      localStorage.removeItem("user");
      set({ user: null, isAuthenticated: false, isAdmin: false, hydrated: true });
    }
  },
}));
