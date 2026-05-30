import api from "./client";
import type { DoctorPerformance } from "@/types/api";

export const analyticsService = {
  getDoctorPerformance: async (
    doctorId: string,
  ): Promise<DoctorPerformance> => {
    const { data } = await api.get<DoctorPerformance>(
      `/doctors/${doctorId}/performance`,
    );
    return data;
  },
};
