import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { leaveService } from "@/api/leave";
import { toast } from "sonner";
import type { CreateLeaveRequestPayload, UpdateLeaveStatusPayload } from "@/types/api";

export const useMyLeaves = () => {
  return useQuery({
    queryKey: ["my-leaves"],
    queryFn: () => leaveService.getMyLeaves(),
  });
};

export const useAllLeaves = () => {
  return useQuery({
    queryKey: ["all-leaves"],
    queryFn: () => leaveService.getAllLeaves(),
  });
};

export const useSubmitLeave = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateLeaveRequestPayload) => leaveService.submitLeave(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-leaves"] });
      toast.success("Gửi yêu cầu nghỉ phép thành công. Vui lòng chờ Admin phê duyệt.");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Không thể gửi yêu cầu nghỉ phép";
      toast.error(message);
    },
  });
};

export const useCancelLeave = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leaveService.cancelLeave(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-leaves"] });
      toast.success("Đã hủy yêu cầu nghỉ phép");
    },
    onError: () => {
      toast.error("Không thể hủy yêu cầu nghỉ phép");
    },
  });
};

export const useUpdateLeaveStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateLeaveStatusPayload }) => 
      leaveService.updateLeaveStatus(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-leaves"] });
      toast.success("Đã cập nhật trạng thái yêu cầu nghỉ");
    },
    onError: () => {
      toast.error("Không thể cập nhật trạng thái");
    },
  });
};
