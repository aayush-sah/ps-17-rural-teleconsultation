import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "../lib/LanguageContext";
import { Background } from "../components/Background";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PS-17 | PHC Teleconsultation System",
  description:
    "Teleconsultation Queue & AI Triage Management for Rural Primary Health Centres in India",
  keywords: ["teleconsultation", "triage", "rural health", "PHC", "India", "ASHA"],
  authors: [{ name: "PS-17 Team" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PS-17 Teleconsult",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#4f46e5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
          crossOrigin="anonymous"
        />
      </head>
      <body className="h-full antialiased">
        <LanguageProvider>
          <Background />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
