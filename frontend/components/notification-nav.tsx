"use client"

import { Bell } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from "date-fns"
import { id as idLocale } from "date-fns/locale"

type Alert = {
    id: string
    severity: string
    issue_description: string
    created_at: string
    stores?: { name: string }[] | { name: string } | any
}

export function NotificationNav({ alerts = [] }: { alerts?: Alert[] }) {
    const unreadCount = alerts.length

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="outline-none border-none relative">
                <Bell className="h-5 w-5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[9px] text-white font-bold">
                        {unreadCount}
                    </span>
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end">
                <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">Notifikasi Sistem</p>
                            <p className="text-xs leading-none text-muted-foreground">
                                {unreadCount > 0 ? `Anda memiliki ${unreadCount} peringatan krusial.` : "Tidak ada peringatan saat ini."}
                            </p>
                        </div>
                    </DropdownMenuLabel>

                    {unreadCount > 0 && <DropdownMenuSeparator />}

                    <div className="max-h-80 overflow-y-auto">
                        {alerts.map((alert) => {
                            const storeName = Array.isArray(alert.stores) ? alert.stores[0]?.name : alert.stores?.name;

                            return (
                                <DropdownMenuItem key={alert.id} className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                                    <div className="flex items-center gap-2 w-full justify-between">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${alert.severity === 'high' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-600'}`}>
                                            {alert.severity.toUpperCase()}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground">
                                            {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true, locale: idLocale })}
                                        </span>
                                    </div>
                                    <span className="text-sm font-medium">{storeName || "Sistem Utama"}</span>
                                    <span className="text-xs text-muted-foreground text-left line-clamp-2">{alert.issue_description}</span>
                                </DropdownMenuItem>
                            )
                        })}
                        {unreadCount === 0 && (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                                Semua sistem berjalan normal.
                            </div>
                        )}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="w-full text-center text-xs text-muted-foreground justify-center cursor-pointer">
                        Lihat Semua Notifikasi
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
