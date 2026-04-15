import { create } from "zustand";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isAdmin: false,

  login: (token: string, user: User) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    set({
      user,
      token,
      isAuthenticated: true,
      isAdmin: user.role === "ADMIN",
    });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
    });
  },

  hydrate: () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      try {
        const user: User = JSON.parse(userStr);
        set({
          user,
          token,
          isAuthenticated: true,
          isAdmin: user.role === "ADMIN",
        });
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  },
}));
