import api from "./client";
import type { Patient } from "@/types/api";

export const patientService = {
  getAll: async (params?: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<Patient[]> => {
    const { data } = await api.get<Patient[]>("/users/patients", { params });
    return data;
  },

  getById: async (patientId: string): Promise<Patient> => {
    const { data } = await api.get<Patient>(`/users/${patientId}`);
    return data;
  },

  getMyProfile: async (): Promise<Patient> => {
    const { data } = await api.get<Patient>("/users/profile");
    return data;
  },

  update: async (patientId: string, payload: Partial<Patient>): Promise<Patient> => {
    const { data } = await api.patch<Patient>(`/users/${patientId}`, payload);
    return data;
  },
};
