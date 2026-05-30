import api from "./client";
import { normalizeDoctor } from "./normalize";
import type { Doctor, ScheduleDay, Review } from "@/types/api";

export const doctorService = {
  getAll: async (params?: {
    verified?: boolean;
    specialization?: string;
    page?: number;
    limit?: number;
  }): Promise<Doctor[]> => {
    const { data } = await api.get<Doctor[]>("/users/doctors", { params });
    return (data || []).map(normalizeDoctor);
  },

  getById: async (doctorId: string): Promise<Doctor> => {
    const { data } = await api.get<any>(`/users/${doctorId}`);
    return normalizeDoctor(data);
  },

  getSchedule: async (doctorId: string, date: string): Promise<ScheduleDay> => {
    const { data } = await api.get<ScheduleDay>(
      `/schedules/doctor/${doctorId}`,
      { params: { date } }
    );
    return data;
  },

  setSchedule: async (doctorId: string, payload: ScheduleDay): Promise<ScheduleDay> => {
    const { data } = await api.post<ScheduleDay>(
      `/schedules/doctor/${doctorId}`,
      payload
    );
    return data;
  },

  getReviews: async (doctorId: string): Promise<Review[]> => {
    const { data } = await api.get<Review[]>(`/reviews/doctor/${doctorId}`);
    return data;
  },
};
