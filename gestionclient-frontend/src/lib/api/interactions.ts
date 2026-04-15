import api from "./axios";
import { Interaction, InteractionFormData, PaginatedResponse } from "@/types";

export const interactionsApi = {
  // GET /api/interactions/client/{clientId}
  getByClientId: async (
    clientId: number,
    params?: {
      page?: number;
      taille?: number;
    },
  ): Promise<PaginatedResponse<Interaction>> => {
    const response = await api.get<PaginatedResponse<Interaction>>(
      `/api/interactions/client/${clientId}`,
      {
        params: {
          page: params?.page ?? 0,
          taille: params?.taille ?? 10,
        },
      },
    );
    return response.data;
  },

  // GET /api/interactions/client/{clientId}/type/{type}
  getByClientAndType: async (
    clientId: number,
    type: string,
    params?: {
      page?: number;
      taille?: number;
    },
  ): Promise<PaginatedResponse<Interaction>> => {
    const response = await api.get<PaginatedResponse<Interaction>>(
      `/api/interactions/client/${clientId}/type/${type}`,
      {
        params: {
          page: params?.page ?? 0,
          taille: params?.taille ?? 10,
        },
      },
    );
    return response.data;
  },

  // GET /api/interactions/recentes
  getRecent: async (): Promise<Interaction[]> => {
    const response = await api.get<Interaction[]>("/api/interactions/recentes");
    return response.data;
  },

  // GET /api/interactions/{id}
  getById: async (id: number): Promise<Interaction> => {
    const response = await api.get<Interaction>(`/api/interactions/${id}`);
    return response.data;
  },

  // POST /api/interactions
  create: async (data: InteractionFormData): Promise<Interaction> => {
    const response = await api.post<Interaction>("/api/interactions", data);
    return response.data;
  },

  // PUT /api/interactions/{id}
  update: async (
    id: number,
    data: InteractionFormData,
  ): Promise<Interaction> => {
    const response = await api.put<Interaction>(
      `/api/interactions/${id}`,
      data,
    );
    return response.data;
  },

  // DELETE /api/interactions/{id}
  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/interactions/${id}`);
  },
};
