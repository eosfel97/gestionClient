import api from "./axios";
import { DashboardStats } from "@/types";

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>("/api/dashboard/stats");
    return response.data;
  },
};
