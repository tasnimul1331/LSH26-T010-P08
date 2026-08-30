import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BottleResult — Explainable & Verifiable School Result Intelligence",
  description: "Every Result Has a Reason. Transform school marks into accurate, explainable, verifiable, and auditable student results.",
  keywords: ["school results", "GPA calculator", "result verification", "grade processing", "education platform"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}>
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
