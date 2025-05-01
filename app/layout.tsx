import type React from "react"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "NTUNHS 總務處器材借用管理系統",
  description: "國立臺北護理健康大學總務處器材借用管理系統",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const storedTheme = localStorage.getItem('equipment-borrowing-theme');
                  if (storedTheme) {
                    document.documentElement.classList.remove('light', 'dark');
                    document.documentElement.classList.add(storedTheme);
                  }
                } catch (e) {
                  console.error('Failed to apply theme:', e);
                }
              })();

              // Prevent ServiceWorker registration in preview environments
              if (window.location.hostname.includes('vusercontent.net')) {
                window.addEventListener('error', function(event) {
                  if (event.message && event.message.includes('ServiceWorker')) {
                    event.preventDefault();
                    console.warn('ServiceWorker registration prevented in preview environment');
                  }
                });
              }
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
          storageKey="equipment-borrowing-theme"
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
