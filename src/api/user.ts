import api from "./client";
import type {
  EmergencyContact,
  UpdateProfileMePayload,
  UpdateDoctorDetailsPayload,
  UpdatePatientDetailsMePayload,
} from "@/types/api";

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: string;
  phone?: string;
  avatar?: string;
  specialization?: string;
  yearsOfExperience?: number;
  licenseNumber?: string;
  verifyStatus?: string;
  averageRating?: number;
  totalPatients?: number;
  dateOfBirth?: string;
  gender?: string;
  bloodType?: string;
  bio?: string;
  consultation_fee?: number | string;
  emergencyContact?: EmergencyContact;
}

const normalizeUser = (u: any): UserProfile => {
  const profile = u.profile || {};
  const dr = profile.doctorDetails || u.doctorDetails || {};
  const pt = profile.patientDetails || u.patientDetails || {};

  return {
    ...u,
    ...profile,
    ...dr,
    ...pt,
    fullName: profile.fullName || profile.full_name || u.fullName || u.full_name || "",
    phone: profile.phone || u.phone || "",
    specialization: dr.specialization || profile.specialization || u.specialization || "",
    yearsOfExperience: dr.experience_years || dr.yearsOfExperience || profile.yearsOfExperience || u.yearsOfExperience || 0,
    licenseNumber: dr.license_number || dr.licenseNumber || profile.licenseNumber || u.licenseNumber || "",
    consultation_fee: dr.consultation_fee || profile.consultation_fee || u.consultation_fee || 0,
    bio: dr.bio || profile.bio || u.bio || "",
    dateOfBirth: profile.dateOfBirth || profile.dob || u.dateOfBirth || u.dob || "",
    bloodType: pt.blood_type || pt.bloodType || profile.bloodType || u.bloodType || "",
    emergencyContact:
      normalizeEmergencyContact(
        pt.emergency_contact || pt.emergencyContact || profile.emergency_contact,
      ) || undefined,
  };
};

function normalizeEmergencyContact(raw: unknown): EmergencyContact | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const name = typeof r.name === "string" ? r.name : "";
  const phone = typeof r.phone === "string" ? r.phone : "";
  if (!name && !phone) return null;
  const relationship =
    typeof r.relationship === "string" ? r.relationship : undefined;
  return { name, phone, ...(relationship ? { relationship } : {}) };
}

export const userService = {
  getProfile: async (): Promise<UserProfile> => {
    const { data } = await api.get<any>("/users/profile");
    return normalizeUser(data);
  },

  getSpecializations: async (): Promise<string[]> => {
    const { data } = await api.get<string[]>("/users/specializations");
    return Array.isArray(data) ? data : [];
  },

  updateMyProfile: async (
    payload: UpdateProfileMePayload,
  ): Promise<UserProfile> => {
    const { data } = await api.patch<any>("/users/profile/me", payload);
    return normalizeUser(data);
  },

  updateMyDoctorDetails: async (
    payload: UpdateDoctorDetailsPayload,
  ): Promise<UserProfile> => {
    const { data } = await api.patch<any>("/users/doctor-details/me", payload);
    return normalizeUser(data);
  },

  updateMyPatientDetails: async (
    payload: UpdatePatientDetailsMePayload,
  ): Promise<UserProfile> => {
    const { data } = await api.patch<any>(
      "/users/patient-details/me",
      payload,
    );
    return normalizeUser(data);
  },

  getAll: async (params?: { role?: string; search?: string }): Promise<UserProfile[]> => {
    const { data } = await api.get<any[]>("/users", { params });
    return (data || []).map(normalizeUser);
  },

  getById: async (userId: string): Promise<UserProfile> => {
    const { data } = await api.get<any>(`/users/${userId}`);
    return normalizeUser(data);
  },

  update: async (userId: string, payload: Partial<UserProfile>): Promise<UserProfile> => {
    const { data } = await api.patch<any>(`/users/${userId}`, payload);
    return normalizeUser(data);
  },

  delete: async (userId: string): Promise<void> => {
    await api.delete(`/users/${userId}`);
  },
};
