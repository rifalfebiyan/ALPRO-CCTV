"use client"

import { User, LogOut, Settings } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

export function UserNav({ userData }: { userData?: { name: string, email: string, username: string, role: string } }) {
    const router = useRouter()

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' })
            router.push('/login')
            router.refresh() // Paksa refresh layout dan middleware
        } catch (error) {
            console.error("Gagal logout:", error)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="outline-none border-none">
                <div className="flex h-8 w-8 rounded-full border items-center justify-center bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90 transition-colors">
                    <User className="w-4 h-4" />
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{userData?.name || "User"} <span className="text-muted-foreground text-xs font-normal">({userData?.role || 'Admin'})</span></p>
                            <p className="text-xs leading-none text-muted-foreground">
                                @{userData?.username || "admin"} • {userData?.email || "user@alpro.co.id"}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Pengaturan Akun</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500 cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Keluar (Logout)</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
