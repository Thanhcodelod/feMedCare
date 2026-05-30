export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show";
export type UserRole = "doctor" | "patient" | "admin" | "nurse";

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  avatar: string;
  rating: number;
  patients: number;
  experience: string;
  available: boolean;
  email: string;
  phone: string;
}

export interface Patient {
  id: string;
  name: string;
  avatar: string;
  dob: string;
  gender: string;
  phone: string;
  email: string;
  bloodType: string;
  lastVisit: string;
  diagnosis: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientAvatar: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  type: "video" | "in-person";
  notes?: string;
  reason: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorName: string;
  date: string;
  diagnosis: string;
  prescription: string[];
  notes: string;
}

export const mockDoctors: Doctor[] = [
  { id: "d1", name: "Dr. Nguyễn Văn An", specialty: "Tim mạch", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=doctor1", rating: 4.9, patients: 248, experience: "12 năm", available: true, email: "an.nguyen@hospital.vn", phone: "0901234567" },
  { id: "d2", name: "Dr. Trần Thị Bích", specialty: "Nội tiết", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=doctor2", rating: 4.8, patients: 312, experience: "8 năm", available: true, email: "bich.tran@hospital.vn", phone: "0901234568" },
  { id: "d3", name: "Dr. Lê Minh Cường", specialty: "Thần kinh", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=doctor3", rating: 4.7, patients: 189, experience: "15 năm", available: false, email: "cuong.le@hospital.vn", phone: "0901234569" },
  { id: "d4", name: "Dr. Phạm Thúy Dung", specialty: "Da liễu", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=doctor4", rating: 4.9, patients: 421, experience: "10 năm", available: true, email: "dung.pham@hospital.vn", phone: "0901234570" },
  { id: "d5", name: "Dr. Hoàng Đức Em", specialty: "Nhi khoa", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=doctor5", rating: 4.6, patients: 356, experience: "7 năm", available: true, email: "em.hoang@hospital.vn", phone: "0901234571" },
];

export const mockPatients: Patient[] = [
  { id: "p1", name: "Trần Văn Nam", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=patient1", dob: "1985-03-15", gender: "Nam", phone: "0912345678", email: "nam.tran@email.com", bloodType: "A+", lastVisit: "2025-01-10", diagnosis: "Huyết áp cao" },
  { id: "p2", name: "Nguyễn Thị Hoa", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=patient2", dob: "1992-07-22", gender: "Nữ", phone: "0912345679", email: "hoa.nguyen@email.com", bloodType: "O+", lastVisit: "2025-01-12", diagnosis: "Tiểu đường type 2" },
  { id: "p3", name: "Lê Hoàng Khải", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=patient3", dob: "1978-11-30", gender: "Nam", phone: "0912345680", email: "khai.le@email.com", bloodType: "B+", lastVisit: "2025-01-08", diagnosis: "Viêm khớp" },
  { id: "p4", name: "Phạm Ngọc Linh", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=patient4", dob: "2000-05-18", gender: "Nữ", phone: "0912345681", email: "linh.pham@email.com", bloodType: "AB+", lastVisit: "2025-01-14", diagnosis: "Mất ngủ" },
  { id: "p5", name: "Bùi Thanh Minh", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=patient5", dob: "1965-09-05", gender: "Nam", phone: "0912345682", email: "minh.bui@email.com", bloodType: "A-", lastVisit: "2025-01-11", diagnosis: "Cholesterol cao" },
  { id: "p6", name: "Võ Thị Nhi", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=patient6", dob: "1998-01-25", gender: "Nữ", phone: "0912345683", email: "nhi.vo@email.com", bloodType: "O-", lastVisit: "2025-01-09", diagnosis: "Đau đầu mãn tính" },
];

export const mockAppointments: Appointment[] = [
  { id: "a1", patientId: "p1", patientName: "Trần Văn Nam", patientAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=patient1", doctorId: "d1", doctorName: "Dr. Nguyễn Văn An", doctorSpecialty: "Tim mạch", date: "2025-01-15", time: "09:00", status: "confirmed", type: "video", reason: "Kiểm tra huyết áp định kỳ" },
  { id: "a2", patientId: "p2", patientName: "Nguyễn Thị Hoa", patientAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=patient2", doctorId: "d1", doctorName: "Dr. Nguyễn Văn An", doctorSpecialty: "Tim mạch", date: "2025-01-15", time: "10:30", status: "pending", type: "video", reason: "Tư vấn chế độ ăn uống" },
  { id: "a3", patientId: "p3", patientName: "Lê Hoàng Khải", patientAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=patient3", doctorId: "d1", doctorName: "Dr. Nguyễn Văn An", doctorSpecialty: "Tim mạch", date: "2025-01-15", time: "11:00", status: "confirmed", type: "in-person", reason: "Đau ngực" },
  { id: "a4", patientId: "p4", patientName: "Phạm Ngọc Linh", patientAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=patient4", doctorId: "d2", doctorName: "Dr. Trần Thị Bích", doctorSpecialty: "Nội tiết", date: "2025-01-15", time: "14:00", status: "completed", type: "video", reason: "Kiểm tra chỉ số đường huyết" },
  { id: "a5", patientId: "p5", patientName: "Bùi Thanh Minh", patientAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=patient5", doctorId: "d1", doctorName: "Dr. Nguyễn Văn An", doctorSpecialty: "Tim mạch", date: "2025-01-16", time: "09:30", status: "pending", type: "video", reason: "Tái khám sau điều trị" },
  { id: "a6", patientId: "p6", patientName: "Võ Thị Nhi", patientAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=patient6", doctorId: "d3", doctorName: "Dr. Lê Minh Cường", doctorSpecialty: "Thần kinh", date: "2025-01-14", time: "15:00", status: "completed", type: "in-person", reason: "Đau đầu kéo dài" },
  { id: "a7", patientId: "p1", patientName: "Trần Văn Nam", patientAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=patient1", doctorId: "d2", doctorName: "Dr. Trần Thị Bích", doctorSpecialty: "Nội tiết", date: "2025-01-13", time: "10:00", status: "cancelled", type: "video", reason: "Tư vấn dinh dưỡng" },
];

export const mockMedicalRecords: MedicalRecord[] = [
  { id: "r1", patientId: "p1", doctorName: "Dr. Nguyễn Văn An", date: "2025-01-10", diagnosis: "Huyết áp cao (Stage 1)", prescription: ["Amlodipine 5mg - 1 viên/ngày", "Losartan 50mg - 1 viên/ngày"], notes: "Bệnh nhân cần theo dõi huyết áp tại nhà 2 lần/ngày. Hạn chế muối < 5g/ngày." },
  { id: "r2", patientId: "p2", doctorName: "Dr. Trần Thị Bích", date: "2025-01-12", diagnosis: "Tiểu đường type 2 kiểm soát kém", prescription: ["Metformin 500mg - 2 viên/ngày", "Glimepiride 2mg - 1 viên/ngày"], notes: "HbA1c = 8.2%. Cần điều chỉnh chế độ ăn. Tái khám sau 1 tháng." },
  { id: "r3", patientId: "p1", doctorName: "Dr. Nguyễn Văn An", date: "2024-12-05", diagnosis: "Nhịp tim không đều nhẹ", prescription: ["Bisoprolol 2.5mg - 1 viên/ngày"], notes: "ECG bình thường. Theo dõi nhịp tim bằng smartwatch." },
];

export const chartData = {
  appointmentsByDay: [
    { day: "T2", appointments: 8 },
    { day: "T3", appointments: 12 },
    { day: "T4", appointments: 6 },
    { day: "T5", appointments: 15 },
    { day: "T6", appointments: 10 },
    { day: "T7", appointments: 4 },
    { day: "CN", appointments: 2 },
  ],
  patientGrowth: [
    { month: "Th7", patients: 120 },
    { month: "Th8", patients: 145 },
    { month: "Th9", patients: 165 },
    { month: "Th10", patients: 189 },
    { month: "Th11", patients: 210 },
    { month: "Th12", patients: 248 },
    { month: "Th1", patients: 285 },
  ],
  revenue: [
    { month: "Th7", revenue: 45000000 },
    { month: "Th8", revenue: 52000000 },
    { month: "Th9", revenue: 61000000 },
    { month: "Th10", revenue: 58000000 },
    { month: "Th11", revenue: 74000000 },
    { month: "Th12", revenue: 89000000 },
    { month: "Th1", revenue: 95000000 },
  ],
  appointmentTypes: [
    { name: "Video Call", value: 65, color: "#2563EB" },
    { name: "Trực tiếp", value: 35, color: "#10B981" },
  ],
};

export const currentUser = {
  id: "d1",
  name: "Dr. Nguyễn Văn An",
  role: "doctor" as UserRole,
  specialty: "Tim mạch",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=doctor1",
  email: "an.nguyen@hospital.vn",
};
