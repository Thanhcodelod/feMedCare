import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

// Typography is Times New Roman across every role; the family is wired
// through the --font-sans/--font-display/--font-mono CSS vars in globals.css,
// so no web font is loaded here.

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
