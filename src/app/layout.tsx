import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNavigation } from "@/components/layout/MobileBottomNavigation";
import { ConsentBanner } from "@/components/consent/ConsentBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "꿈과 운의 사전",
  description: "정통 명리학 공식에 기반한 고품질 사주 만세력 및 전문 운세 플랫폼",
  verification: {
    other: {
      "naver-site-verification": "74c54ccaad17dc656a6e64be35fa04955cb3d47b",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-navy">
        <Header />
        <main className="flex-grow pb-16 md:pb-0">{children}</main>
        <Footer />
        <MobileBottomNavigation />
        <ConsentBanner />
      </body>
    </html>
  );
}
