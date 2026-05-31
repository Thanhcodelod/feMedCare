import type { Metadata } from "next";
import { Inter_Tight, Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

// UI font: tight tracking + neutral grotesque — feels like modern
// clinical software, not a SaaS template.
const interTight = Inter_Tight({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

// Display: editorial serif for page titles and named entities (patient
// names, doctor names). Used sparingly — kills the "AI dashboard" smell.
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: ["400", "500", "600"],
});

// Tabular numerals for medical record numbers, vitals, dates in tables.
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "MedCare — Clinical Workstation",
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

  const fontVars = `${interTight.variable} ${fraunces.variable} ${jetbrains.variable}`;

  return (
    <html lang="en" className={fontVars} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {apiUrl.startsWith("http") && <link rel="preconnect" href={apiUrl} />}
      </head>
      <body className="font-sans" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
