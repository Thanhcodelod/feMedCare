import api from "./client";
import { normalizeDoctor, normalizeDoctorForAdmin } from "./normalize";
import type { AdminAnalytics, Doctor } from "@/types/api";
import { userService } from "./user";

export const adminService = {
  getAnalytics: async (): Promise<AdminAnalytics> => {
    const { data } = await api.get<AdminAnalytics>("/admin/analytics");
    return data;
  },

  getPendingDoctors: async (): Promise<Doctor[]> => {
    const { data } = await api.get<Doctor[]>("/admin/doctors/pending");
    return (data || []).map(normalizeDoctor);
  },

  verifyDoctor: async (
    doctorId: string,
    status: "VERIFIED" | "REJECTED"
  ): Promise<Doctor> => {
    const { data } = await api.post<Doctor>("/admin/doctors/verify", {
      doctor_id: doctorId,
      is_verified: status === "VERIFIED",
    });
    return data;
  },

  registerDoctor: async (payload: any): Promise<any> => {
    const { data } = await api.post("/auth/register/doctor", payload);
    return data;
  },

  getAllUsers: async (params?: { role?: string; search?: string }) => {
    try {
      if (params?.role === "DOCTOR") {
        const { data } = await api.get("/users/doctors", {
          params: { search: params?.search },
        });
        return Array.isArray(data)
          ? data.map((d: any) => ({ ...normalizeDoctorForAdmin(d), role: "DOCTOR" }))
          : [];
      }
      if (params?.role === "PATIENT") {
        const { data } = await api.get("/users/patients", {
          params: { search: params?.search },
        });
        return Array.isArray(data)
          ? data.map((p: any) => ({
              ...p,
              ...(p.profile || {}),
              ...(p.patient_details || {}),
              role: "PATIENT",
            }))
          : [];
      }
    } catch (error) {
      console.warn(
        "Role-specific endpoint failed, falling back to /users",
        error
      );
    }

    const data = await userService.getAll(params);
    if (params?.role && Array.isArray(data)) {
      return data.filter((u: any) => u.role === params.role);
    }
    return data || [];
  },

  getUserById: async (userId: string) => userService.getById(userId),

  updateUser: async (userId: string, payload: any) =>
    userService.update(userId, payload),

  deleteUser: async (userId: string): Promise<void> => userService.delete(userId),

  /**
   * POST /admin/nurses — ADMIN creates a NURSE account. BE auto-sets
   * role=NURSE so the FE must NOT pass `role` (forbidNonWhitelisted).
   */
  createNurse: async (payload: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    avatarUrl?: string;
  }) => {
    const { data } = await api.post("/admin/nurses", payload);
    return data;
  },

  /** POST /appointments/admin/sweep-no-shows — manual NO_SHOW cron trigger. */
  sweepNoShows: async (): Promise<{ swept: number }> => {
    const { data } = await api.post("/appointments/admin/sweep-no-shows");
    return data;
  },

  /**
   * POST /teleconsultation/admin/:id/force-end — ADMIN force-ends a
   * stuck telemedicine call (e.g. socket leaks, peer crash).
   */
  forceEndCall: async (appointmentId: string) => {
    const { data } = await api.post(
      `/teleconsultation/admin/${appointmentId}/force-end`,
    );
    return data;
  },

  /** GET /teleconsultation/health — gateway snapshot for the admin page. */
  getTeleconsultationHealth: async () => {
    const { data } = await api.get("/teleconsultation/health");
    return data;
  },
};
