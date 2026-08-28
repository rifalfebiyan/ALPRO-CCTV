import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Search, Bell, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/user-nav"

import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { Suspense } from 'react'
import { NotificationNavServer } from '@/components/notification-nav-server'

export default async function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    const cookieStore = await cookies()
    const token = cookieStore.get('alpro_token')?.value
    let userData: { name: string, email: string, username: string, role: string } | undefined = undefined
    if (token) {
        const decoded = await verifyToken(token)
        if (decoded) {
            userData = {
                name: decoded.name as string,
                email: decoded.email as string,
                username: decoded.username as string,
                role: decoded.role as string
            }
        }
    }

    return (
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
                            <Suspense fallback={<Bell className="h-5 w-5 text-muted-foreground animate-pulse" />}>
                                <NotificationNavServer />
                            </Suspense>
                            <UserNav userData={userData} />
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
    )
}
