import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Search, Bell, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", geist.variable)}
    >
      <body>
        <ThemeProvider>
          <TooltipProvider>
            <SidebarProvider>
              <AppSidebar />
              <main className="flex flex-col flex-1 h-screen overflow-hidden bg-background text-foreground relative">
                <header className="flex h-14 items-center gap-4 border-b bg-muted/20 px-4 lg:h-[60px] lg:px-6 w-full shrink-0">
                  <SidebarTrigger />
                  <div className="w-full flex-1">
                    <form>
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="search"
                          placeholder="Search ALPRO CCTV..."
                          className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                        />
                      </div>
                    </form>
                  </div>
                  <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <Bell className="h-5 w-5 text-muted-foreground cursor-pointer hover:text-foreground" />
                    <div className="flex h-8 w-8 rounded-full border items-center justify-center bg-primary text-primary-foreground">
                      <User className="w-4 h-4" />
                    </div>
                  </div>
                </header>
                <div className="flex-1 overflow-auto">
                  {children}
                </div>
                <footer className="border-t border-border/50 py-3 px-6 text-xs text-muted-foreground flex items-center justify-between shrink-0">
                  <span>&copy; 2026 ALPRO Security System. Hak Cipta Dilindungi.</span>
                  <span className="font-mono"></span>
                </footer>
              </main>
            </SidebarProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
