import api from "./client";
import type {
  LeaveRequest,
  CreateLeaveRequestPayload,
  UpdateLeaveStatusPayload,
} from "@/types/api";

export const leaveService = {
  submitLeave: async (payload: CreateLeaveRequestPayload): Promise<LeaveRequest> => {
    const { data } = await api.post<any>("/leave-requests", payload);
    const raw = data.leaveRequest || data;
    return {
      ...raw,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
    };
  },

  getMyLeaves: async (): Promise<LeaveRequest[]> => {
    const { data } = await api.get<any[]>("/leave-requests/my-leaves");
    return (data || []).map((item) => ({
      ...item,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  },

  cancelLeave: async (id: string): Promise<void> => {
    await api.delete(`/leave-requests/${id}`);
  },

  getAllLeaves: async (): Promise<LeaveRequest[]> => {
    const { data } = await api.get<any[]>("/leave-requests/admin/all");
    return (data || []).map((item) => ({
      ...item,
      doctor_name: item.doctor?.profile?.full_name || item.doctor?.profile?.fullName || "Bác sĩ",
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  },

  updateLeaveStatus: async (id: string, payload: UpdateLeaveStatusPayload): Promise<LeaveRequest> => {
    const { data } = await api.patch<any>(`/leave-requests/admin/${id}/status`, payload);
    const raw = data.leaveRequest || data;
    return {
      ...raw,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
    };
  },
};
