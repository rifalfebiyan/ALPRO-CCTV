import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, ShieldCheck, ShieldAlert, Wifi, MessageSquare, Bot } from "lucide-react"

export default function IoTAlarmPage() {
    return (
        <div className="flex-1 p-4 md:p-8 pt-6 space-y-6 overflow-y-auto h-full">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Oasis Alarm System</h2>
                <p className="text-muted-foreground mt-1">Monitoring IoT Alarm cabang terintegrasi (ESP32 via Telegram API).</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Sample Card for Apotek Alpro Joglo Raya */}
                <Card className="shadow-sm border-emerald-500/50 bg-emerald-500/5 transition-all hover:shadow-md">
                    <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle className="text-base font-semibold">Toko 2018</CardTitle>
                                <CardDescription className="text-xs">Apotek Alpro Express Joglo Raya</CardDescription>
                            </div>
                            <Badge className="bg-emerald-500 hover:bg-emerald-600">SIAGA</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 pt-2">
                            <div className="flex items-center gap-2 text-sm">
                                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                <span className="font-medium text-emerald-600 dark:text-emerald-400">System Armed</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                                <div className="flex items-center gap-1.5 text-muted-foreground border rounded-md p-1.5 bg-background">
                                    <Wifi className="h-3 w-3 text-emerald-500" />
                                    WIFI OK
                                </div>
                                <div className="flex items-center gap-1.5 text-muted-foreground border rounded-md p-1.5 bg-background">
                                    <Activity className="h-3 w-3" />
                                    PIR: Aman
                                </div>
                            </div>
                            <div className="text-[10px] text-muted-foreground pt-2 flex justify-between border-t border-emerald-500/20">
                                <span>Sync: 2 mnt lalu</span>
                                <span className="flex items-center gap-1 text-blue-500 font-medium"><MessageSquare className="h-3 w-3" /> Telegram</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Another Card: Alarm Triggered */}
                <Card className="shadow-sm border-red-500/50 bg-red-500/5 transition-all hover:shadow-md relative overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-1 bg-red-500 animate-pulse" />
                    <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle className="text-base font-semibold">Toko 1099</CardTitle>
                                <CardDescription className="text-xs">Apotek Alpro Express Sudirman</CardDescription>
                            </div>
                            <Badge variant="destructive" className="animate-pulse">ALARM!!</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 pt-2">
                            <div className="flex items-center gap-2 text-xs sm:text-sm">
                                <ShieldAlert className="h-4 w-4 text-red-500" />
                                <span className="font-bold text-red-600 line-clamp-1">MALING DI PINTU</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                                <div className="flex items-center gap-1.5 text-red-600/80 border-red-200 border rounded-md p-1.5 bg-background">
                                    <MessageSquare className="h-3 w-3" />
                                    SMS BACKUP
                                </div>
                                <div className="flex items-center gap-1.5 text-red-600 border-red-200 border rounded-md p-1.5 bg-background">
                                    <Activity className="h-3 w-3 animate-bounce" />
                                    CALLING PIC
                                </div>
                            </div>
                            <div className="text-[10px] text-muted-foreground pt-2 flex justify-between border-t border-red-500/20">
                                <span>Trigger: 01:23 menit lalu</span>
                                <span className="flex items-center gap-1 font-mono text-red-500">SIM800L</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Another Card: Offline / Setup */}
                <Card className="shadow-sm border-zinc-200 dark:border-zinc-800 opacity-70">
                    <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle className="text-base font-semibold">Toko 3051</CardTitle>
                                <CardDescription className="text-xs">Apotek Alpro Express Grogol</CardDescription>
                            </div>
                            <Badge variant="secondary">OFF</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 pt-2">
                            <div className="flex items-center gap-2 text-sm">
                                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground text-xs">Disarmed (Toko Buka)</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[10px] opacity-70">
                                <div className="flex items-center gap-1.5 text-muted-foreground border rounded-md p-1.5">
                                    <Wifi className="h-3 w-3" />
                                    WIFI OK
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* API Reference Banner */}
            <div className="bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-400 p-4 md:p-6 rounded-xl text-xs sm:text-sm mt-8">
                <h4 className="font-bold flex items-center gap-2 mb-2 text-base"><Bot className="w-5 h-5" /> Integrasi "Oasis Alarm" ESP32 API</h4>
                <p className="leading-relaxed text-blue-600/90 dark:text-blue-300">
                    Berdasarkan <em>source code</em> ESP32 Anda, perangkat memantau konektivitas WiFi & SIM800L dan mengirimkan status (`/status`, `SIAGA`, `ALARM!!`) melalui <strong>UniversalTelegramBot</strong> API serta me-logging secara HTTP ke <em>script.google.com</em>.
                </p>
                <p className="mt-2 text-blue-600/90 dark:text-blue-300">Untuk mengintegrasikannya dan menjadikannya <em>Live</em> di dashboard ini selayaknya CCTV, kita bisa mengatur:</p>
                <ul className="list-disc ml-5 mt-2 space-y-1 text-blue-600/80 dark:text-blue-300/80">
                    <li><strong>Telegram Webhooks</strong>: Next.js mengambil alih atau "mengintip" (*listen*) notifikasi bot (ID: <code>8296158180:AAH...</code>) agar UI otomatis berubah merah bila ada trigger.</li>
                    <li><strong>Database Bypass</strong>: Di versi berikutnya, kita bisa mengubah rute HTTP Request ESP32 di baris <code>logToSheet()</code> agar langsung menembak API Supabase Next.js ini daripada ke Google Sheets!</li>
                </ul>
            </div>
        </div>
    )
}
