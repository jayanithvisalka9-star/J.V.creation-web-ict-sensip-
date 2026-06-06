import type { Metadata } from "next";
import { Inter, Orbitron, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
});

export const metadata: Metadata = {
  title: "ICT Sensip - Sir Hasith Illangasinghe",
  description: "Official Student Dashboard and Attendance Portal for Sir Hasith Illangasinghe's ICT Sensip Private Classes. Powered by JV Creations.",
  keywords: ["ICT Sensip", "Hasith Illangasinghe", "ICT Class", "Attendance QR", "JV Creations"],
  authors: [{ name: "JV Creations" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${orbitron.variable} ${spaceGrotesk.variable}`}>
      <body class="bg-darkBg text-slate-100 min-h-screen flex flex-col relative bg-grid">
        {/* Floating background neon spheres */}
        <div class="absolute top-10 left-10 w-96 h-96 glow-sphere-1 pointer-events-none z-0"></div>
        <div class="absolute bottom-20 right-10 w-[500px] h-[500px] glow-sphere-2 pointer-events-none z-0"></div>

        <Navbar />
        <main class="relative z-10 flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
