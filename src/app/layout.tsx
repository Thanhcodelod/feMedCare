import type { Metadata } from "next";
// Mantine CSS bản "layer" — nằm trong @layer mantine (ưu tiên thấp), import
// TRƯỚC globals.css để Tailwind/shadcn luôn thắng, không vỡ giao diện hiện có.
import "@mantine/core/styles.layer.css";
import "@mantine/notifications/styles.layer.css";
import "./globals.css";
import { Providers } from "./providers";


export const metadata: Metadata = {
  title: "MedCare",
  description: "Hệ thống quản lý phòng khám hiện đại",
  icons: {
    icon: "/medcare-logo.png",
    shortcut: "/medcare-logo.png",
    apple: "/medcare-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8888";

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {apiUrl.startsWith("http") && <link rel="preconnect" href={apiUrl} />}
      </head>
      <body className="font-sans" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
