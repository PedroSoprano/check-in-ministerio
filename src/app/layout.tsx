import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ToastProvider";

const SITE_URL = "https://check-in-ministerio.vercel.app";

export const metadata: Metadata = {
  title: "Check-in Ministério de Fantoches",
  description: "Check-in e programação do ministério",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Check-in Ministério",
  },
  openGraph: {
    url: SITE_URL,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#1a365d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="light" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-white text-gray-800">
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
