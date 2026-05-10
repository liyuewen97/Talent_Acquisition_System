import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Talent Acquisition System",
  description: "猎头团队人才管理系统 V1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
