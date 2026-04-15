import api from "./axios";
import { AdminUser } from "@/types";

export interface ProfilUpdateData {
  nom: string;
  prenom: string;
  email: string;
}

export interface ChangePasswordData {
  ancienPassword: string;
  nouveauPassword: string;
}

export const profilApi = {
  // GET /api/profil
  get: async (): Promise<AdminUser> => {
    const response = await api.get<AdminUser>("/api/profil");
    return response.data;
  },

  // PUT /api/profil
  update: async (data: ProfilUpdateData): Promise<AdminUser> => {
    const response = await api.put<AdminUser>("/api/profil", data);
    return response.data;
  },

  // PATCH /api/profil/password
  changePassword: async (
    data: ChangePasswordData,
  ): Promise<{ message: string }> => {
    const response = await api.patch<{ message: string }>(
      "/api/profil/password",
      data,
    );
    return response.data;
  },
};
