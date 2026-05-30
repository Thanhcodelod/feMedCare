import api from "./client";
import type {
  MedicalRecord,
  UpdateMedicalRecordPayload,
} from "@/types/api";

export const medicalRecordService = {
  getAll: async (): Promise<MedicalRecord[]> => {
    const { data } = await api.get<MedicalRecord[]>("/medical-records");
    return data || [];
  },

  getById: async (id: string): Promise<MedicalRecord> => {
    const { data } = await api.get<MedicalRecord>(`/medical-records/${id}`);
    return data;
  },

  getMyPatientRecords: async (): Promise<MedicalRecord[]> => {
    const { data } = await api.get<MedicalRecord[]>(
      "/medical-records/patient/me",
    );
    return data || [];
  },

  getMyDoctorRecords: async (): Promise<MedicalRecord[]> => {
    const { data } = await api.get<MedicalRecord[]>(
      "/medical-records/doctor/me",
    );
    return data || [];
  },

  update: async (
    id: string,
    payload: UpdateMedicalRecordPayload,
  ): Promise<MedicalRecord> => {
    const { data } = await api.patch<MedicalRecord>(
      `/medical-records/${id}`,
      payload,
    );
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/medical-records/${id}`);
  },
};
