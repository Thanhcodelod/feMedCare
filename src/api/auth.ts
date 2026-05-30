import api from "./client";
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  RegisterDoctorPayload,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  MessageResponse,
} from "@/types/api";
import { userService } from "./user";

type LoginRequest = { email: string; password: string };

export async function apiRegister(payload: RegisterPayload) {
  const { data } = await api.post("/auth/register", payload);
  return data;
}

export async function apiRegisterDoctor(payload: RegisterDoctorPayload) {
  const { data } = await api.post("/auth/register/doctor", payload);
  return data;
}

export async function apiLogin(payload: LoginRequest) {
  const { data } = await api.post("/auth/login", payload);
  return data;
}

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/auth/login", payload);
    return data;
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/auth/register", payload);
    return data;
  },

  registerDoctor: async (
    payload: RegisterDoctorPayload,
  ): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>(
      "/auth/register/doctor",
      payload,
    );
    return data;
  },

  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
  },

  me: async () => {
    return userService.getProfile();
  },

  changePassword: async (payload: ChangePasswordPayload): Promise<MessageResponse> => {
    const { data } = await api.post<MessageResponse>("/auth/change-password", payload);
    return data;
  },

  forgotPassword: async (payload: ForgotPasswordPayload): Promise<MessageResponse> => {
    const { data } = await api.post<MessageResponse>("/auth/forgot-password", payload);
    return data;
  },

  resetPassword: async (payload: ResetPasswordPayload): Promise<MessageResponse> => {
    const { data } = await api.post<MessageResponse>("/auth/reset-password", payload);
    return data;
  },
};
