import type { Metadata } from "next";
import { Suspense } from "react";
import { Poppins } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { Header } from "@/components/layout/header";
import { AuthModal } from "@/components/auth/auth-modal";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CuroNews - Curated Health News",
  description: "Discover curated health news, research, and tips from trusted sources.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} font-sans antialiased`} suppressHydrationWarning={true}>
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <div className="min-h-screen flex flex-col">
                <Suspense fallback={<div className="h-16 md:h-20" />}> 
                  <Header />
                </Suspense>
                <main className="flex-1">{children}</main>
              </div>
              <AuthModal />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
