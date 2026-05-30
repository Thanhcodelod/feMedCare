"use client";
import dynamic from "next/dynamic";

const PatientBookAppointment = dynamic(
  () =>
    import("@/components/PatientBookAppointment").then(
      (mod) => mod.PatientBookAppointmentComponent,
    ),
  {
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    ),
    ssr: false,
  },
);

export default function Page() {
  return <PatientBookAppointment />;
}
