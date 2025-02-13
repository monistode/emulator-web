import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ProcessorProvider } from "@/util/processor";
import { IOProvider } from "@/util/io";
import { Toaster } from "sonner";
import { SelectedByteProvider } from "@/util/selected-byte";
import { AssemblerProvider } from "@/util/assembler";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Monistode Emulator",
  description: "Web-based emulator for the Monistode architecture",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
      >
        <IOProvider>
          <ProcessorProvider>
            <SelectedByteProvider>
              <AssemblerProvider>
                <SidebarProvider>
                  <Sidebar />
                  <SidebarInset>
                    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 bg-background">
                      <SidebarTrigger />
                      <Separator orientation="vertical" className="h-4" />
                      <div className="font-semibold">Monistode</div>
                    </header>
                    <div className="flex-1 overflow-auto">
                      <div className="container mx-auto p-4 flex flex-col items-center">
                        {children}
                      </div>
                    </div>
                  </SidebarInset>
                </SidebarProvider>
                <Toaster theme="dark" />
              </AssemblerProvider>
            </SelectedByteProvider>
          </ProcessorProvider>
        </IOProvider>
      </body>
    </html>
  );
}
