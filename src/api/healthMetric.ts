import api from "./client";
import type {
  CreateHealthMetricPayload,
  HealthMetric,
  HealthStats,
} from "@/types/api";

export const healthMetricService = {
  getMyStats: async (): Promise<HealthStats> => {
    const { data } = await api.get<HealthStats>("/patients/me/health-stats");
    return data;
  },

  create: async (
    payload: CreateHealthMetricPayload,
  ): Promise<HealthMetric> => {
    const { data } = await api.post<HealthMetric>(
      "/patients/me/health-metrics",
      payload,
    );
    return data;
  },
};
