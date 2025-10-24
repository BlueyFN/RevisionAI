import "./globals.css";

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "RevisionAI",
  description: "StudyAI Chatbot"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased")}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
