import { ErrorBoundaryWrapper } from "@/components/ErrorBoundaryWrapper";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/api/AuthProvider";
import { QueryProvider } from "@/lib/providers/query-provider";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono, DM_Serif_Display, IBM_Plex_Sans } from "next/font/google";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const ibmPlex = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SuperAgent — AI-Powered Real Estate Assistant",
  description:
    "Calm, intelligent workflow interface for real estate professionals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  const content = (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${dmSerif.variable} ${ibmPlex.variable} antialiased`}
      >
        <ErrorBoundaryWrapper>
          <QueryProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
            <Toaster
              position="top-center"
              richColors
              closeButton
              toastOptions={{
                style: {
                  background: "white",
                  color: "#18181b",
                  border: "1px solid rgba(0,0,0,0.05)",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                },
              }}
            />
          </QueryProvider>
        </ErrorBoundaryWrapper>
      </body>
    </html>
  );

  // Always wrap with ClerkProvider - it handles missing keys gracefully
  // Components using Clerk will check for key availability themselves
  return (
    <ClerkProvider publishableKey={publishableKey}>{content}</ClerkProvider>
  );
}
