import api from "./axios";
import { Client, ClientFormData, PaginatedResponse } from "@/types";

interface PaginationParams {
  page?: number;
  taille?: number;
  tri?: string;
  direction?: string;
}

export const clientsApi = {
  // GET /api/clients
  getAll: async (
    params?: PaginationParams,
  ): Promise<PaginatedResponse<Client>> => {
    const response = await api.get<PaginatedResponse<Client>>("/api/clients", {
      params: {
        page: params?.page ?? 0,
        taille: params?.taille ?? 10,
        tri: params?.tri ?? "dateCreation",
        direction: params?.direction ?? "desc",
      },
    });
    return response.data;
  },

  // GET /api/clients/recherche?q=...
  search: async (
    q: string,
    params?: PaginationParams,
  ): Promise<PaginatedResponse<Client>> => {
    const response = await api.get<PaginatedResponse<Client>>(
      "/api/clients/recherche",
      {
        params: {
          q,
          page: params?.page ?? 0,
          taille: params?.taille ?? 10,
          tri: params?.tri ?? "nom",
          direction: params?.direction ?? "asc",
        },
      },
    );
    return response.data;
  },

  // GET /api/clients/statut/{statut}
  getByStatut: async (
    statut: string,
    params?: PaginationParams,
  ): Promise<PaginatedResponse<Client>> => {
    const response = await api.get<PaginatedResponse<Client>>(
      `/api/clients/statut/${statut}`,
      {
        params: {
          page: params?.page ?? 0,
          taille: params?.taille ?? 10,
          tri: params?.tri ?? "dateCreation",
          direction: params?.direction ?? "desc",
        },
      },
    );
    return response.data;
  },

  // GET /api/clients/{id}
  getById: async (id: number): Promise<Client> => {
    const response = await api.get<Client>(`/api/clients/${id}`);
    return response.data;
  },

  // POST /api/clients
  create: async (data: ClientFormData): Promise<Client> => {
    const response = await api.post<Client>("/api/clients", data);
    return response.data;
  },

  // PUT /api/clients/{id}
  update: async (id: number, data: ClientFormData): Promise<Client> => {
    const response = await api.put<Client>(`/api/clients/${id}`, data);
    return response.data;
  },

  // DELETE /api/clients/{id}
  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/clients/${id}`);
  },
};
