import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { FeatureFlagProvider } from "@/components/shared/FeatureFlagProvider";

import { MainLayout } from "@/components/layout/MainLayout";
import { MobileLayout } from "@/components/mobile/MobileLayout";
import { useMobileDetection } from "@/hooks/useMobileDetection";
import "../styles/mobile.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Audience - Modern Platform",
  description: "Best-in-class sample sourcing platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <FeatureFlagProvider>
          <MainLayout>
            {children}
          </MainLayout>
        </FeatureFlagProvider>
      </body>
    </html>
  );
}
