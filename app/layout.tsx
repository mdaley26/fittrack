import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { Nav } from "@/components/Nav";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "FitTrack – Workout & Progress Tracker",
  description: "Track workouts, monitor performance, and reach your fitness goals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} font-sans antialiased bg-slate-950 text-slate-200`}
      >
        <AuthProvider>
          <Nav />
          <main className="min-h-screen pb-20">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
