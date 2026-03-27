import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "@/components/providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mini-lancer",
  description: "Mini-lancer is a SaaS platform that gives freelancers one place to manage clients, track projects, send invoices, and collect payments — without the chaos of spreadsheets and manual follow-ups. Every client gets a secure portal to track their project progress and pay instantly, so freelancers spend less time chasing and more time earning.",
  icons: {
    icon: "https://res.cloudinary.com/dc4yjx0dc/image/upload/v1774610710/logo_tj5qjv.png",
    shortcut:
      "https://res.cloudinary.com/dc4yjx0dc/image/upload/v1774610710/logo_tj5qjv.png",
    apple:
      "https://res.cloudinary.com/dc4yjx0dc/image/upload/v1774610710/logo_tj5qjv.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        suppressHydrationWarning
        className={`${inter.variable} h-full`}
      >
        <body className="min-h-full font-body antialiased bg-background text-foreground">
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
