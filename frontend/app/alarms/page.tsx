import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { ShieldCheck, ShieldAlert, Bot, Clock, ListOrdered } from "lucide-react"
import { createClient } from "@/lib/server"

// Memaksa Next.js untuk tidak me-cache halaman ini agar data selalu ter-refresh secara LIVE
export const revalidate = 0;

export default async function IoTAlarmPage() {
    const supabase = await createClient()

    // Menarik semua data status terbaru IoT dari database
    const { data: alarms } = await supabase
        .from('iot_alarms')
        .select('*')
        .order('last_updated', { ascending: false })

    // Menarik 50 riwayat log terbaru
    const { data: logs } = await supabase
        .from('iot_alarm_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

    return (
        <div className="flex-1 p-4 md:p-8 pt-6 space-y-8 overflow-y-auto h-full">
            {/* SECTION 1: STATUS TERKINI */}
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Oasis Alarm System</h2>
                <p className="text-muted-foreground mt-1">Monitoring status IoT Alarm cabang via Webhook ESP32.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {(!alarms || alarms.length === 0) && (
                    <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                        Belum ada data alarm masuk dari ESP32.
                    </div>
                )}

                {alarms?.map((alarm: any) => {
                    const isAlarm = alarm.status === "ALARM!!"
                    const isSiaga = alarm.status === "SIAGA" || alarm.status === "ONLINE" || alarm.status === "PENDING"

                    let borderColor = "border-zinc-200 dark:border-zinc-800"
                    let bgColor = "opacity-70"
                    let badgeVariant = "secondary" as any
                    let badgeClass = ""

                    if (isAlarm) {
                        borderColor = "border-red-500/50"
                        bgColor = "bg-red-500/5"
                        badgeVariant = "destructive"
                        badgeClass = "animate-pulse"
                    } else if (isSiaga) {
                        borderColor = "border-emerald-500/50"
                        bgColor = "bg-emerald-500/5 opacity-100"
                        badgeClass = "bg-emerald-500 hover:bg-emerald-600"
                    }

                    return (
                        <Card key={alarm.store_code} className={`shadow-sm transition-all hover:shadow-md ${borderColor} ${bgColor} ${isAlarm ? 'relative overflow-hidden' : ''}`}>
                            {isAlarm && <div className="absolute inset-x-0 top-0 h-1 bg-red-500 animate-pulse" />}
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-base font-semibold">Toko {alarm.store_code}</CardTitle>
                                        <CardDescription className="text-xs">{alarm.store_name}</CardDescription>
                                    </div>
                                    <Badge variant={badgeVariant} className={badgeClass}>{alarm.status}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4 pt-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        {isAlarm ? <ShieldAlert className="h-4 w-4 text-red-500" /> : <ShieldCheck className={`h-4 w-4 ${isSiaga ? 'text-emerald-500' : 'text-muted-foreground'}`} />}
                                        <span className={`font-medium ${isAlarm ? 'text-red-500 font-bold' : (isSiaga ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground')}`}>
                                            {alarm.description || "Aman Terkendali"}
                                        </span>
                                    </div>
                                    <div className="text-[10px] text-muted-foreground pt-2 flex justify-between border-t border-primary/10">
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Update: {new Date(alarm.last_updated).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* SECTION 2: RIWAYAT LOG */}
            <div>
                <h3 className="text-lg font-bold tracking-tight flex items-center gap-2 mb-4">
                    <ListOrdered className="w-5 h-5" /> Riwayat Log Alarm (50 Terbaru)
                </h3>
                <Card className="shadow-sm">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[180px]">Waktu</TableHead>
                                    <TableHead>Kode Toko</TableHead>
                                    <TableHead>Nama Toko</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Keterangan</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(!logs || logs.length === 0) ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                            Belum ada riwayat log.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    logs.map((log: any) => {
                                        const isAlarm = log.status === "ALARM!!"
                                        return (
                                            <TableRow key={log.id} className={isAlarm ? 'bg-red-50 dark:bg-red-950/20' : ''}>
                                                <TableCell className="text-xs font-mono">
                                                    {new Date(log.created_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}
                                                </TableCell>
                                                <TableCell className="font-semibold">{log.store_code}</TableCell>
                                                <TableCell className="text-xs">{log.store_name}</TableCell>
                                                <TableCell>
                                                    <Badge variant={isAlarm ? "destructive" : "secondary"} className="text-[10px]">
                                                        {log.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-xs">{log.description || "-"}</TableCell>
                                            </TableRow>
                                        )
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
