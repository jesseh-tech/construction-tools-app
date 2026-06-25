import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { EstimateProvider } from "./EstimateProvider";
import { AssistantWidget } from "./AssistantWidget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "10 Cent Construction Tools",
  description: "Construction-industry tools with a built-in AI assistant.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#faf9f5] text-gray-900">
        <EstimateProvider>
          {children}
          <AssistantWidget />
        </EstimateProvider>
      </body>
    </html>
  );
}
