import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NexChat Neon",
  description: "High-end real-time chat — cyberpunk edition",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={jetbrainsMono.variable}>
      <body className="font-jetbrains antialiased">
        <AuthProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: "rgba(8,10,24,0.95)",
                color: "#f1f5f9",
                border: "1px solid rgba(0,242,255,0.2)",
                borderRadius: "12px",
                backdropFilter: "blur(20px)",
                fontSize: "13px",
                fontFamily: "var(--font-jetbrains), monospace",
                boxShadow: "0 0 30px rgba(0,242,255,0.08), 0 8px 32px rgba(0,0,0,0.6)",
              },
              success: {
                iconTheme: { primary: "#00F2FF", secondary: "#050505" },
              },
              error: {
                iconTheme: { primary: "#FF2D78", secondary: "#050505" },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
