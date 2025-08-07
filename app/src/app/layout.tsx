import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Import components
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CookieBanner from "@/components/common/CookieBanner";
import { AuthProvider } from "@/app/components/AuthProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Promptly - AI Prompt Sharing Platform",
  description: "Share and discover AI prompts for enhancing your creative workflow",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.variable} antialiased bg-background text-text`}>
        <AuthProvider>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 px-4 md:px-10 lg:px-40 py-5 flex justify-center">
              <div className="max-w-[960px] w-full">
                {children}
              </div>
            </main>
            <Footer />
            <CookieBanner />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
