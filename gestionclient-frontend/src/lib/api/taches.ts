import api from "./axios";
import { Tache, TacheFormData, PaginatedResponse } from "@/types";

interface PaginationParams {
  page?: number;
  taille?: number;
  tri?: string;
  direction?: string;
}

export const tachesApi = {
  // GET /api/taches
  getAll: async (
    params?: PaginationParams,
  ): Promise<PaginatedResponse<Tache>> => {
    const response = await api.get<PaginatedResponse<Tache>>("/api/taches", {
      params: {
        page: params?.page ?? 0,
        taille: params?.taille ?? 10,
        tri: params?.tri ?? "dateEcheance",
        direction: params?.direction ?? "asc",
      },
    });
    return response.data;
  },

  // GET /api/taches/statut/{statut}
  getByStatut: async (
    statut: string,
    params?: {
      page?: number;
      taille?: number;
    },
  ): Promise<PaginatedResponse<Tache>> => {
    const response = await api.get<PaginatedResponse<Tache>>(
      `/api/taches/statut/${statut}`,
      {
        params: {
          page: params?.page ?? 0,
          taille: params?.taille ?? 20,
        },
      },
    );
    return response.data;
  },

  // GET /api/taches/client/{clientId}
  getByClientId: async (clientId: number): Promise<Tache[]> => {
    const response = await api.get<Tache[]>(`/api/taches/client/${clientId}`);
    return response.data;
  },

  // GET /api/taches/en-retard
  getOverdue: async (): Promise<Tache[]> => {
    const response = await api.get<Tache[]>("/api/taches/en-retard");
    return response.data;
  },

  // GET /api/taches/a-venir?jours=7
  getUpcoming: async (jours: number = 7): Promise<Tache[]> => {
    const response = await api.get<Tache[]>("/api/taches/a-venir", {
      params: { jours },
    });
    return response.data;
  },

  // GET /api/taches/{id}
  getById: async (id: number): Promise<Tache> => {
    const response = await api.get<Tache>(`/api/taches/${id}`);
    return response.data;
  },

  // POST /api/taches
  create: async (data: TacheFormData): Promise<Tache> => {
    const response = await api.post<Tache>("/api/taches", data);
    return response.data;
  },

  // PUT /api/taches/{id}
  update: async (id: number, data: TacheFormData): Promise<Tache> => {
    const response = await api.put<Tache>(`/api/taches/${id}`, data);
    return response.data;
  },

  // PATCH /api/taches/{id}/statut — pour le kanban drag & drop
  updateStatus: async (id: number, statut: string): Promise<Tache> => {
    const response = await api.patch<Tache>(`/api/taches/${id}/statut`, {
      statut,
    });
    return response.data;
  },

  // DELETE /api/taches/{id}
  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/taches/${id}`);
  },
};
