import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { createClient } from "@/lib/server"

// Memaksa Next.js untuk tidak me-cache halaman ini agar data selalu ter-refresh secara LIVE
export const revalidate = 0;

export default async function IoTAlarmPage() {
    const supabase = await createClient()

    const { data: alarms } = await supabase
        .from('iot_alarms')
        .select('*')
        .order('last_updated', { ascending: false })

    const { data: logs } = await supabase
        .from('iot_alarm_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Oasis Alarm System</h2>
            </div>

            {/* TABEL STATUS TERKINI */}
            <div className="rounded-md border bg-card shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Kode Toko</TableHead>
                            <TableHead>Nama Toko</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead>Keterangan</TableHead>
                            <TableHead className="text-right">Terakhir Update</TableHead>
                            <TableHead className="text-center">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(!alarms || alarms.length === 0) ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                    Belum ada data alarm aktif dari ESP32.
                                </TableCell>
                            </TableRow>
                        ) : (
                            alarms.map((alarm: any) => {
                                const isAlarm = alarm.status === "ALARM!!"
                                const isSiaga = alarm.status === "SIAGA" || alarm.status === "ONLINE" || alarm.status === "PENDING"

                                return (
                                    <TableRow key={alarm.store_code} className={isAlarm ? 'bg-red-50 dark:bg-red-950/10' : ''}>
                                        <TableCell className="font-medium">{alarm.store_code}</TableCell>
                                        <TableCell>{alarm.store_name}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge
                                                variant={isAlarm ? "destructive" : "secondary"}
                                                className={isSiaga ? "bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 border-emerald-500/20" : ""}
                                            >
                                                {alarm.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className={isAlarm ? 'text-red-500 font-medium' : 'text-muted-foreground'}>
                                            {alarm.description || "Aman Terkendali"}
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground">
                                            {new Date(alarm.last_updated).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}
                                        </TableCell>
                                        <TableCell className="text-center space-x-1">
                                            <button type="button" className="text-xs bg-muted hover:bg-muted/80 text-foreground px-2 py-1 rounded-sm shadow-sm border transition">
                                                Status
                                            </button>
                                            <button type="button" className="text-xs bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-900/40 dark:text-red-400 dark:hover:bg-red-900/60 border-red-200 dark:border-red-800 px-2 py-1 rounded-sm shadow-sm border transition">
                                                Matikan
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* TABEL RIWAYAT LOG */}
            <div className="flex items-center justify-between space-y-2 pt-4">
                <h2 className="text-3xl font-bold tracking-tight">Riwayat Log Alarm</h2>
            </div>
            <div className="rounded-md border bg-card shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Waktu Kejadian</TableHead>
                            <TableHead>Kode Toko</TableHead>
                            <TableHead>Nama Toko</TableHead>
                            <TableHead className="text-center">Status</TableHead>
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
                                        <TableCell className="text-muted-foreground">
                                            {new Date(log.created_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}
                                        </TableCell>
                                        <TableCell className="font-medium">{log.store_code}</TableCell>
                                        <TableCell>{log.store_name}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={isAlarm ? "destructive" : "secondary"}>
                                                {log.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{log.description || "-"}</TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="text-xs text-muted-foreground mr-4">
                    Showing {logs?.length || 0} entries
                </div>
            </div>
        </div>
    )
}
