import type {
  Doctor,
  Appointment,
  OrderSummary,
  PrescriptionItem,
} from "@/types/api";

type Raw = Record<string, any>;

export function getDoctorId(d: Pick<Doctor, "id" | "doctorId"> | null | undefined): string {
  return d?.doctorId || d?.id || "";
}

function firstDefined<T>(...values: (T | undefined | null)[]): T | undefined {
  for (const v of values) {
    if (v !== undefined && v !== null && v !== "") return v as T;
  }
  return undefined;
}

export function normalizeDoctor(d: Raw): Doctor {
  const profile: Raw = d.profile || {};
  const details: Raw = d.doctor_details || d.doctorDetails || {};
  const userId = d.id || profile.user_id || d.userId;
  const doctorDetailsId = details.id || d.doctorId;

  return {
    ...d,
    ...profile,
    ...details,
    id: userId,
    doctorId: doctorDetailsId,
    fullName:
      firstDefined<string>(
        d.fullName,
        profile.fullName,
        d.full_name,
        profile.full_name,
        d.name,
        profile.name,
      ) || "Doctor",
    email: firstDefined<string>(d.email, profile.email),
    phone: firstDefined<string>(d.phone, profile.phone),
    avatar: firstDefined<string>(
      d.avatar,
      profile.avatar,
      d.avatar_url,
      profile.avatar_url,
    ),
    specialization: firstDefined<string>(
      d.specialization,
      details.specialization,
      profile.specialization,
    ),
    yearsOfExperience: firstDefined<number>(
      d.experience_years,
      d.yearsOfExperience,
      d.years_of_experience,
      details.experience_years,
      details.yearsOfExperience,
      details.years_of_experience,
      profile.experience_years,
    ) ?? 0,
    licenseNumber: firstDefined<string>(
      d.license_number,
      d.licenseNumber,
      details.license_number,
      details.licenseNumber,
    ),
    consultation_fee: firstDefined<string | number>(
      d.consultation_fee,
      d.consultationFee,
      details.consultation_fee,
      details.consultationFee,
    ),
    averageRating: firstDefined<number>(
      d.average_rating,
      d.averageRating,
      d.rating,
      details.average_rating,
      details.averageRating,
    ) ?? 0,
    totalPatients: firstDefined<number>(
      d.total_patients,
      d.totalPatients,
      details.total_patients,
      details.totalPatients,
    ) ?? 0,
    bio: firstDefined<string>(d.bio, details.bio, profile.bio),
  } as unknown as Doctor;
}

export function normalizeDoctorForAdmin(d: Raw): Doctor & { userId?: string } {
  const base = normalizeDoctor(d);
  const profile: Raw = d.profile || {};
  const details: Raw = d.doctor_details || d.doctorDetails || {};
  const userId = d.id || profile.user_id || d.userId;
  const doctorDetailsId = details.id || d.doctorId;

  const explicit = firstDefined<string>(
    d.verify_status,
    d.verifyStatus,
    details.verify_status,
    details.verifyStatus,
  );
  const isVerified = firstDefined<boolean>(
    d.is_verified,
    d.isVerified,
    details.is_verified,
    details.isVerified,
  );
  let verifyStatus: "VERIFIED" | "PENDING" | "REJECTED";
  if (explicit === "VERIFIED" || explicit === "PENDING" || explicit === "REJECTED") {
    verifyStatus = explicit;
  } else if (isVerified === true) {
    verifyStatus = "VERIFIED";
  } else if (isVerified === false) {
    verifyStatus = "PENDING";
  } else {
    verifyStatus = "PENDING";
  }

  return {
    ...base,
    id: doctorDetailsId || userId,
    userId,
    verifyStatus,
  } as unknown as Doctor & { userId?: string };
}

function normalizeOrders(raw: unknown): OrderSummary[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((o: Raw): OrderSummary | null => {
      const id = o?.id ?? o?.order_id ?? o?.orderId;
      if (!id) return null;
      const status =
        (o?.status as OrderSummary["status"]) ??
        (o?.success === true ? "PAID" : "PENDING");
      return {
        id: String(id),
        amount: Number(o?.amount ?? 0),
        status,
        transfer_code: o?.transfer_code ?? o?.transferCode,
      };
    })
    .filter((o): o is OrderSummary => o !== null);
}

function normalizeReview(raw: any): Appointment["review"] {
  // BE may include `review` as either the object directly or wrapped
  // in a 1-element array depending on the Prisma relation type. Handle
  // both shapes so consumers get a consistent {id, rating, ...} or null.
  const r = Array.isArray(raw) ? raw[0] : raw;
  if (!r || typeof r !== "object") return null;
  if (typeof r.rating !== "number") return null;
  return {
    id: String(r.id ?? ""),
    rating: r.rating,
    comment: typeof r.comment === "string" ? r.comment : undefined,
    createdAt: r.created_at ?? r.createdAt,
  };
}

export function normalizeAppointment(item: Raw): Appointment {
  const orders = normalizeOrders(item.orders);
  return {
    id: item.id,
    appointmentCode: item.appointment_code || item.id?.split("-")?.[0] || "",
    patientId: item.patient?.id || "",
    patientName: item.patient?.profile?.full_name || "",
    patientAvatar: item.patient?.profile?.avatar_url || "",
    doctorId: item.doctor?.id || "",
    doctorName: item.doctor?.profile?.full_name || "",
    doctorAvatar: item.doctor?.profile?.avatar_url || "",
    doctorSpecialization: item.doctor?.specialization || "",
    date: item.appointment_date ? String(item.appointment_date).split("T")[0] : "",
    startTime: item.start_time || "",
    endTime: item.end_time || "",
    status: item.status,
    type: item.appointment_type,
    reason: item.patient_note,
    meetingUrl: item.meeting_url,
    requires_payment: item.requires_payment ?? false,
    orders,
    payment_method: item.payment_method,
    diagnosis: item.diagnosis,
    prescription: (item.prescription as PrescriptionItem[] | undefined) ?? undefined,
    notes: item.notes,
    cancellationReason: item.cancellation_reason ?? item.cancellationReason,
    review: normalizeReview(item.review ?? item.reviews),
    createdAt: item.created_at || new Date().toISOString(),
  };
}
