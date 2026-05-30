import api from "./client";
import type { CreateReviewPayload, Review } from "@/types/api";

export const reviewService = {
  create: async (payload: CreateReviewPayload): Promise<Review> => {
    const { data } = await api.post<Review>("/reviews", payload);
    return data;
  },

  getForDoctor: async (doctorId: string): Promise<Review[]> => {
    const { data } = await api.get<Review[]>(`/reviews/doctor/${doctorId}`);
    return data;
  },
};
