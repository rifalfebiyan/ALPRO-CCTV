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
import { AlarmActions } from "@/components/alarm-actions"
import { DataPagination } from "@/components/data-pagination"

// Memaksa Next.js untuk tidak me-cache halaman ini agar data selalu ter-refresh secara LIVE
export const revalidate = 0;

export default async function IoTAlarmPage(props: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const searchParams = props.searchParams ? await props.searchParams : undefined
    const aPage = searchParams?.aPage ? parseInt(searchParams.aPage as string, 10) : 1
    const lPage = searchParams?.lPage ? parseInt(searchParams.lPage as string, 10) : 1
    const limit = 10

    const aFrom = (aPage - 1) * limit
    const aTo = aFrom + limit - 1

    const lFrom = (lPage - 1) * limit
    const lTo = lFrom + limit - 1

    const supabase = await createClient()

    const { data: alarms, count: aCount } = await supabase
        .from('iot_alarms')
        .select('*', { count: 'exact' })
        .order('last_updated', { ascending: false })
        .range(aFrom, aTo)

    const { data: logs, count: lCount } = await supabase
        .from('iot_alarm_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(lFrom, lTo)

    const aTotalPages = aCount ? Math.ceil(aCount / limit) : 0
    const lTotalPages = lCount ? Math.ceil(lCount / limit) : 0

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
                                        <TableCell className="text-center">
                                            <AlarmActions storeCode={alarm.store_code} storeName={alarm.store_name} />
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between py-2 pl-4 pr-1">
                <div className="text-xs text-muted-foreground">
                    Showing {alarms?.length || 0} of {aCount || 0} entries
                </div>
                <DataPagination
                    currentPage={aPage}
                    totalPages={aTotalPages}
                    createPageUrl={(p) => `/alarms?aPage=${p}&lPage=${lPage}`}
                />
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
            <div className="flex items-center justify-between py-2 pl-4 pr-1">
                <div className="text-xs text-muted-foreground">
                    Showing {logs?.length || 0} of {lCount || 0} entries
                </div>
                <DataPagination
                    currentPage={lPage}
                    totalPages={lTotalPages}
                    createPageUrl={(p) => `/alarms?aPage=${aPage}&lPage=${p}`}
                />
            </div>
        </div>
    )
}
