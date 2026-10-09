"use client"
import { Card, CardContent } from "@/components/ui/card"
import { ShieldAlert, ShieldCheck, Wrench, Settings2, ShieldX, Cctv } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatusCounts {
    total: number
    active: number
    warning: number
    maintenance: number
    repaired: number
    disconnected: number
}

const getStyles = (status: string) => {
    switch (status) {
        case "Normal": return { icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
        case "Warning": return { icon: ShieldAlert, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" };
        case "Maintenance": return { icon: Wrench, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" };
        case "Repaired": return { icon: Settings2, color: "text-teal-600", bg: "bg-teal-500/10", border: "border-teal-500/20" };
        case "Disconnected": return { icon: ShieldX, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" };
        default: return { icon: Cctv, color: "text-slate-500", bg: "bg-slate-500/10", border: "border-slate-500/20" };
    }
}

function MetricCard({ title, value, statusKey }: { title: string, value: number, statusKey: string }) {
    const { icon: Icon, color, bg, border } = getStyles(statusKey)

    return (
        <Card className={cn("overflow-hidden border shadow-sm transition-all hover:shadow-md", bg, border)}>
            <div className="p-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
                    <div className="text-2xl font-bold">{value}</div>
                </div>
                <div className={cn("h-10 w-10 rounded-full flex items-center justify-center bg-background/50 border", color, border)}>
                    <Icon size={20} />
                </div>
            </div>
        </Card>
    )
}

export function StatusMetrics({ counts }: { counts: StatusCounts }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
            <MetricCard title="Total Stores" value={counts.total} statusKey="Total" />
            <MetricCard title="Normal" value={counts.active} statusKey="Normal" />
            <MetricCard title="Warning" value={counts.warning} statusKey="Warning" />
            <MetricCard title="Maintenance" value={counts.maintenance} statusKey="Maintenance" />
            <MetricCard title="Repaired" value={counts.repaired} statusKey="Repaired" />
            <MetricCard title="Disconnected" value={counts.disconnected} statusKey="Disconnected" />
        </div>
    )
}
