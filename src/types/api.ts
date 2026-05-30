
export type UserRole = "DOCTOR" | "PATIENT" | "ADMIN" | "NURSE";
export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";
export type AppointmentType = "ONLINE" | "OFFLINE";
export type DoctorVerifyStatus = "PENDING" | "VERIFIED" | "REJECTED";
export type PaymentMethod = "ADVANCE_PAYMENT" | "PAYMENT_AT_CLINIC";

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface RegisterDoctorPayload {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  avatarUrl?: string;
  specialization: string;
  experience_years?: number;
  bio?: string;
  consultation_fee?: number;
  qualifications?: string[];
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: AuthUser & {
    profile?: {
      fullName: string;
      phone?: string;
    };
  };
  token_type?: string;
  expires_in?: number;
}

export interface AuthUser {
  id: string; 
  fullName: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  specialization?: string;
  yearsOfExperience?: number;
  licenseNumber?: string;
  verifyStatus?: DoctorVerifyStatus;
  averageRating?: number;
  totalPatients?: number;
  consultation_fee?: string | number;
  bio?: string;
  experience_years?: number;
  average_rating?: number;
}

export interface ScheduleSlot {
  start_time: string; // "HH:mm"
  end_time: string;   // "HH:mm"
}

export interface ScheduleDay {
  date?: string; // "YYYY-MM-DD"
  availableSlots?: ScheduleSlot[];
  slots?: ScheduleSlot[]; // Legacy support
}

export interface BookAppointmentPayload {
  doctorId: string;
  date: string;       // "YYYY-MM-DD"
  startTime: string;  // "HH:mm"
  endTime: string;    // "HH:mm"
  type: AppointmentType;
  reason?: string;
  payment_method: PaymentMethod; // ADVANCE_PAYMENT or PAYMENT_AT_CLINIC
}

export interface BookAppointmentRequestPayload {
  doctor_id: string;
  appointment_date: string; // "YYYY-MM-DD"
  start_time: string;       // "HH:mm"
  appointment_type: AppointmentType;
  payment_method: PaymentMethod;
  patient_note?: string;
}

export interface BookAppointmentResponse {
  appointment: Appointment;
  order: CreateOrderResponse | null;
  /** True if the appointment requires up-front payment (ADVANCE_PAYMENT
   *  for ONLINE flows, false for PAYMENT_AT_CLINIC). */
  requires_payment: boolean;
  payment_method: PaymentMethod;
  message?: string;
}

export interface CompleteAppointmentPayload {
  diagnosis: string;
  diagnostic_code?: string; // ICD-10, MaxLength 20
  /** Optional now: doctor may complete a visit with no prescription
   *  (e.g. wellness check, physiotherapy). Omit the field entirely —
   *  do NOT send `""`, BE rejects empty strings via @IsNotEmpty when
   *  the field IS present. */
  prescription?: string;    // MaxLength 10000
  advice?: string;          // MaxLength 2000
  treatment?: string;       // MaxLength 2000
}

/** MaxLengths for POST /appointments/:id/complete. Distinct from
 *  MEDICAL_RECORD_LIMITS because the BE DTOs are separate (and use
 *  different ceilings — `prescription` is 10000 here vs 5000 there). */
export const COMPLETE_APPOINTMENT_LIMITS = {
  diagnosis: 5000,
  diagnostic_code: 20,
  prescription: 10000,
  advice: 2000,
  treatment: 2000,
} as const;

export interface PrescriptionItem {
  name: string;
  dosage: string;
  frequency: string;
  duration?: string;
}

/**
 * Per-appointment order summary returned alongside an appointment.
 * Mirrors `OrderStatus` but uses BE's snake_case `transfer_code`.
 * For PAYMENT_AT_CLINIC flows BE returns an empty array.
 */
export interface OrderSummary {
  id: string;
  amount: number;
  status: OrderStatus;
  transfer_code?: string;
}

export interface Appointment {
  id: string;
  appointmentCode: string;
  patientId: string;
  patientName: string;
  patientAvatar?: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization?: string;
  date: string;
  startTime: string;
  endTime: string;
  requires_payment?: boolean;
  payment_method?: PaymentMethod;
  /** SePay orders linked to this appointment. Index 0 is the most
   *  recent. Empty array for PAYMENT_AT_CLINIC. Replaced the legacy
   *  `payment: PaymentInfo` field that used the now-deleted VNPay
   *  Payment model. */
  orders?: OrderSummary[];
  status: AppointmentStatus;
  type: AppointmentType;
  reason?: string;
  meetingUrl?: string;
  diagnosis?: string;
  prescription?: PrescriptionItem[];
  notes?: string;
  cancellationReason?: string;
  /** Patient-submitted review for this appointment. Present only after
   *  the patient has rated the visit — BE returns null/undefined otherwise.
   *  Used by the appointments list to hide the "Đánh giá" CTA. */
  review?: {
    id: string;
    rating: number;
    comment?: string;
    createdAt?: string;
  } | null;
  createdAt: string;
}

export interface Doctor {
  id: string;
  userId?: string;
  doctorId?: string;
  fullName: string;
  name?: string;
  email: string;
  phone?: string;
  avatar?: string;
  specialization: string;
  yearsOfExperience: number;
  licenseNumber?: string;
  verifyStatus: DoctorVerifyStatus;
  averageRating: number;
  totalPatients: number;
  consultation_fee?: string | number;
  bio?: string;
  experience_years?: number;
  average_rating?: number;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship?: string;
}

export const EMERGENCY_CONTACT_LIMITS = {
  name: 120,
  phone: 20,
  relationship: 50,
} as const;

export const HEALTH_METRIC_LIMITS = {
  weight: { min: 1, max: 500 }, // kg
  height: { min: 30, max: 250 }, // cm
  heart_rate: { min: 20, max: 250 }, // bpm
  temperature: { min: 25, max: 45 }, // °C
  bmi: { min: 5, max: 80 },
  blood_pressure_pattern: /^\d{2,3}\/\d{2,3}$/,
} as const;

export const MEDICAL_RECORD_LIMITS = {
  diagnosis: 5000,
  treatment: 5000,
  prescription: 5000,
  doctor_advice: 2000,
  diagnostic_code: 50,
} as const;

export const AUTH_FIELD_LIMITS = {
  email: 254,
  password: 128,
  passwordMin: 8,
  fullName: 120,
  phone: 20,
  avatarUrl: 500,
} as const;

export interface Patient {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodType?: string;
  allergies?: string[];
  chronicDiseases?: string[];
  surgicalHistory?: Array<{ event: string; date: string; notes?: string }>;
  weightTrend?: Array<{ date: string; value: number }>;
  insurance?: {
    provider: string;
    cardNumber: string;
    expiryDate: string;
  };
}

export type OrderStatus = "PENDING" | "PAID" | "FAILED";

export interface CreateOrderPayload {
  amount: number;
  appointmentId?: string;
}

export interface CreateOrderResponse {
  orderId: string;
  amount: number;
  transferCode: string;
  qrUrl: string;
  /** Set when the order was created through /appointments/book. */
  appointmentId?: string;
}

export interface OrderStatusResponse {
  orderId: string;
  amount: number;
  status: OrderStatus;
  transferCode: string;
  success: boolean;
  /** Null when the order is standalone (no appointment binding). */
  appointmentId: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * POST /reviews payload. BE intentionally does NOT accept `doctor_id` —
 * the server looks it up from `appointment.doctor_id` to prevent a
 * patient from bombing reviews against a doctor they didn't actually
 * see. Sending `doctor_id` here returns 400 (forbidNonWhitelisted).
 */
export interface CreateReviewPayload {
  appointment_id: string;
  /** 1–5 stars, integer. */
  rating: number;
  comment?: string;
}

export interface Review {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface AdminStats {
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  pendingDoctors: number;
  completedAppointments: number;
  revenue?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export type LeaveSession = "MORNING" | "AFTERNOON" | "FULL_DAY";
export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface CreateLeaveRequestPayload {
  date: string;     // "YYYY-MM-DD"
  session: LeaveSession;
  reason?: string;
}

export interface LeaveRequest {
  id: string;
  doctor_id: string;
  doctor_name?: string;
  date: string;
  session: LeaveSession;
  reason?: string;
  status: LeaveStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateLeaveStatusPayload {
  status: LeaveStatus;
}

export interface ApiError {
  message: string | string[];
  statusCode: number;
  error?: string;
}

export interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  new_password: string;
}

export interface MessageResponse {
  message: string;
}

export const RESET_TOKEN_REGEX = /^[A-Za-z0-9_-]{32,128}$/;
export const PASSWORD_MIN_LENGTH = 8;

export interface UpdateProfileMePayload {
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  gender?: "MALE" | "FEMALE";
  address?: string;
}

export interface UpdateDoctorDetailsPayload {
  specialization?: string;
  experience_years?: number;
  bio?: string;
  consultation_fee?: number;
  qualifications?: string[];
}

export interface UpdatePatientDetailsMePayload {
  blood_type?: string;
  allergies?: string[];
  medical_history?: string;
  emergency_contact?: EmergencyContact;
}

export interface HealthStats {
  user_id: string;
  avg_weight?: number | null;
  avg_heart_rate?: number | null;
  avg_blood_pressure?: string | null;
  avg_temperature?: number | null;
  avg_bmi?: number | null;
  last_recorded?: string | null;
}

export interface CreateHealthMetricPayload {
  weight?: number;       // kg, 1-500
  height?: number;       // cm, 30-250
  heart_rate?: number;   // bpm, 20-250
  blood_pressure?: string; // "120/80"
  temperature?: number;  // °C, 25-45
  bmi?: number;          // 5-80
}

export interface HealthMetric extends CreateHealthMetricPayload {
  id: string;
  user_id: string;
  recorded_at: string;
}

/** Nested user reference returned by BE relation includes. */
export interface MedicalRecordPersonRef {
  id: string;
  profile?: {
    full_name?: string;
    fullName?: string;
    phone?: string;
    avatar_url?: string;
    date_of_birth?: string;
    gender?: string;
    blood_type?: string;
  };
}

export interface MedicalRecordAppointmentRef {
  id: string;
  appointment_code?: string;
  appointment_date?: string;
  start_time?: string;
  end_time?: string;
  appointment_type?: AppointmentType;
}

export interface MedicalRecord {
  id: string;
  appointment_id: string;
  patient_id: string;
  doctor_id: string;
  diagnosis: string;
  diagnostic_code?: string;
  treatment?: string;
  /** Null when the doctor explicitly marked the visit as not needing
   *  a prescription. Renderers MUST handle the null branch (don't crash
   *  on `prescription.split(...)`). */
  prescription: string | null;
  doctor_advice?: string;
  created_at: string;
  updated_at: string;
  /** BE eager-loads these relations on /medical-records/* endpoints.
   *  Optional because admin-only endpoints may shape them differently. */
  patient?: MedicalRecordPersonRef;
  doctor?: MedicalRecordPersonRef & { specialization?: string };
  appointment?: MedicalRecordAppointmentRef;
}

export interface UpdateMedicalRecordPayload {
  diagnosis?: string;
  diagnostic_code?: string;
  treatment?: string;
  prescription?: string;
  doctor_advice?: string;
}

export interface DoctorPerformance {
  patientsToday: number;
  consultationTimeAvg: string; // e.g. "15m"
  satisfactionRate: number;
  weeklyAppointments: number[]; // 7-day array
}

export interface AdminAnalytics {
  peakHours: Record<string, number>; // { "08": 12, "09": 25, ... }
  totalRevenue: number;
  totalAppointments: number;
}

// ---------- Nurse queue ----------
// BE returns snake_case for the today-queue endpoint; types mirror the
// shape exactly so the UI can read fields without an extra normalize
// pass (the data is shown then forgotten — no need to camelize).
export type NurseOrderStatus = "PENDING" | "PAID" | "FAILED";

export interface QueueOrderSummary {
  id: string;
  amount: number;
  status: NurseOrderStatus;
}

export interface QueuePersonRef {
  id: string;
  profile: { full_name: string; phone?: string };
}

export interface QueueDoctorRef extends QueuePersonRef {
  specialization: string;
}

export interface QueueItem {
  id: string;
  appointment_code: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  patient_note: string | null;
  cancellation_reason: string | null;
  patient: QueuePersonRef;
  doctor: QueueDoctorRef;
  /** Empty for PAYMENT_AT_CLINIC; one element with PAID/PENDING/FAILED
   *  for ADVANCE_PAYMENT after the SePay webhook lands. */
  orders: QueueOrderSummary[];
}

export interface CheckInPayload {
  /** BE rejects the call with 400 if this is anything other than `true`
   *  — the field exists specifically as a guard against accidental
   *  click-through. */
  payment_confirmed: true;
  /** Optional reception note, MaxLength 500 (BE DTO). */
  note?: string;
}
