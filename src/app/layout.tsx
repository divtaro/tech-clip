import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TechClip - 技術記事の積読",
  description: "気になった技術記事を登録・管理するアプリケーション",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 2000,
              success: {
                duration: 4000,
              },
              error: {
                duration: 5000,
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
