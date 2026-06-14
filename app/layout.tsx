import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
// @ts-ignore
import "./globals.css";
import Header from "@/components/common/header";
import { ThemeProvider } from "next-themes";
import ClerkThemeWrapper from "@/components/common/clerk-theme";
import { SidebarProvider } from "@/components/ui/sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Docvora",
  description: "Summarise your PDFs with the power of AI",
  icons:{
    icon:"/Docvora_light_logo.png",
    apple:"/Docvora_light_logo.png"
  }
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ClerkThemeWrapper>
            <Header />
            <div className="relative flex flex-col min-h-screen">
              <SidebarProvider>
                <main className="flex-1">{children}</main>
              </SidebarProvider>
            </div>
          </ClerkThemeWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}