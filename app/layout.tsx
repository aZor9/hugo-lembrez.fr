import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hugo Lembrez | Développeur Full-Stack",
  description:
    "Portfolio de Hugo Lembrez — Développeur Full-Stack passionné par le web moderne, React, Next.js et TypeScript.",
  keywords: [
    "développeur",
    "full-stack",
    "portfolio",
    "Next.js",
    "React",
    "TypeScript",
    "Hugo Lembrez",
  ],
  authors: [{ name: "Hugo Lembrez" }],
  openGraph: {
    title: "Hugo Lembrez | Développeur Full-Stack",
    description:
      "Portfolio de Hugo Lembrez — Développeur Full-Stack passionné par le web moderne.",
    type: "website",
    locale: "fr_FR",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body
        className={`${inter.className} bg-slate-950 text-white antialiased`}
      >
        <Providers>
          {/* Orbes animées en arrière-plan */}
          <div className="fixed inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-float" />
            <div
              className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl animate-float"
              style={{ animationDelay: "2s" }}
            />
            <div
              className="absolute -bottom-40 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-float"
              style={{ animationDelay: "4s" }}
            />
          </div>
          {children}
        </Providers>
      </body>
    </html>
  );
}
