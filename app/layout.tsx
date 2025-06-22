import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NotificationProvider } from "../src/components/ui/NotificationSystem";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bí Ẩn Marlene Harrington - Game Trinh Thám",
  description: "Trò chơi trinh thám tương tác - Giải quyết bí ẩn cái chết của Marlene Harrington. Điều tra, thu thập bằng chứng và tìm ra hung thủ thật sự.",
  keywords: "game trinh thám, mystery game, detective game, bí ẩn, điều tra",
  viewport: "width=device-width, initial-scale=1",
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
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </body>
    </html>
  );
}
