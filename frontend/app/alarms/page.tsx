import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, ShieldCheck, ShieldAlert, Wifi, MessageSquare, Bot, Clock } from "lucide-react"
import { createClient } from "@/lib/server"

// Memaksa Next.js untuk tidak me-cache halaman ini agar data selalu ter-refresh secara LIVE
export const revalidate = 0;

export default async function IoTAlarmPage() {
    const supabase = await createClient()

    // Menarik semua data Webhook IoT dari database
    const { data: alarms, error } = await supabase
        .from('iot_alarms')
        .select('*')
        .order('last_updated', { ascending: false })

    return (
        <div className="flex-1 p-4 md:p-8 pt-6 space-y-6 overflow-y-auto h-full">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Oasis Alarm System (Live DB)</h2>
                <p className="text-muted-foreground mt-1">Monitoring status IoT Alarm berdasarkan tarikan data Webhook asli dari ESP32.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {(!alarms || alarms.length === 0) && (
                    <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                        Belum ada tembakan alarm masuk dari alat ESP32. <br /> Coba tekan tombol / jalankan sensor ESP Anda sekarang untuk men-trigger Webhook-nya!
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
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Terakhir Update: {new Date(alarm.last_updated).toLocaleTimeString('id-ID')}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* API Reference Banner */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 p-4 md:p-6 rounded-xl text-xs sm:text-sm mt-8">
                <h4 className="font-bold flex items-center gap-2 mb-2 text-base"><Bot className="w-5 h-5" /> IoT Mode Aktif (Berbasis Webhook)</h4>
                <p className="leading-relaxed text-emerald-600/90 dark:text-emerald-300">
                    Halaman ini sekarang secara resmi mengambil data dari tabel <strong>iot_alarms</strong> di Database Supabase Anda! Layar biru percontohan (desain statis) sebelumnya sudah dihapus. Data yang ada di kotak putih di atas secara absolut mewakili alat keras Anda.
                </p>
            </div>
        </div>
    )
}
