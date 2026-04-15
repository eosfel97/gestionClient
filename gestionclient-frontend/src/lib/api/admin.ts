import api from "./axios";
import { AdminUser } from "@/types";

export const adminApi = {
  // GET /api/admin/users
  getUsers: async (): Promise<AdminUser[]> => {
    const response = await api.get<AdminUser[]>("/api/admin/users");
    return response.data;
  },

  // GET /api/admin/users/commerciaux
  getCommerciaux: async (): Promise<AdminUser[]> => {
    const response = await api.get<AdminUser[]>("/api/admin/users/commerciaux");
    return response.data;
  },

  // GET /api/admin/users/{id}
  getById: async (id: number): Promise<AdminUser> => {
    const response = await api.get<AdminUser>(`/api/admin/users/${id}`);
    return response.data;
  },

  // PATCH /api/admin/users/{id}/toggle-actif
  toggleActif: async (id: number): Promise<AdminUser> => {
    const response = await api.patch<AdminUser>(
      `/api/admin/users/${id}/toggle-actif`,
    );
    return response.data;
  },

  // PATCH /api/admin/users/{id}/role — body: { "role": "ADMIN" }
  changeRole: async (id: number, role: string): Promise<AdminUser> => {
    const response = await api.patch<AdminUser>(`/api/admin/users/${id}/role`, {
      role,
    });
    return response.data;
  },

  // DELETE /api/admin/users/{id}
  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/api/admin/users/${id}`);
  },
};
