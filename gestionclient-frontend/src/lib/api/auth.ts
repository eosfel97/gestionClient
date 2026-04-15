import api from "./axios";
import { AuthResponse, LoginRequest, RegisterRequest } from "@/types";

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/api/auth/login", data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<void> => {
    await api.post("/api/auth/register", data);
  },
};
