import { createClient } from "@/lib/server"
import { CameraFeed } from "@/components/camera-feed"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, HardDrive, Wifi, ShieldAlert, Cpu, Settings2 } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function StoreDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    // Ambil detail toko spesifik beserta relasi NVR dan Kameranya
    const { data: store, error } = await supabase
        .from('stores')
        .select(`
      *,
      nvrs (
        *,
        cameras (*)
      )
    `)
        .eq('id', id)
        .single()

    if (error || !store) {
        notFound()
    }

    const nvr = store.nvrs?.[0]
    const cameras = nvr?.cameras || []
    const channels = cameras.length
    const isWarning = store.status === 'Warning'

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 md:pt-6 h-full overflow-y-auto">
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                <Link href="/stores">
                    <Button variant="ghost" size="icon" className="hidden md:flex">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <Link href="/stores" className="md:hidden">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <h2 className="text-2xl font-bold tracking-tight">{store.name}</h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Badge variant={isWarning ? "secondary" : "default"} className={isWarning ? 'bg-amber-500/15 text-amber-500' : 'bg-emerald-500/15 text-emerald-500'}>
                            {store.status}
                        </Badge>
                        <span className="hidden sm:inline">•</span>
                        <span className="font-medium">NVR: {nvr?.model || 'Unknown'}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>IP: {nvr?.ip_address || 'N/A'}</span>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Select defaultValue="all">
                        <SelectTrigger className="w-[120px] md:w-[150px]">
                            <SelectValue placeholder="View Layout" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Channels</SelectItem>
                            <SelectItem value="4">Grid 2x2</SelectItem>
                            <SelectItem value="9">Grid 3x3</SelectItem>
                            <SelectItem value="16">Grid 4x4</SelectItem>
                        </SelectContent>
                    </Select>
                    <Link href={`/stores/${store.id}/edit`}>
                        <Button variant="outline" className="gap-2">
                            <Settings2 className="w-4 h-4 hidden md:block" />
                            <span>Edit Konfig</span>
                        </Button>
                    </Link>
                </div>
            </div>

            {nvr ? (
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    <Card className="shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs md:text-sm font-medium">Storage</CardTitle>
                            <HardDrive className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl md:text-2xl font-bold">{nvr.storage_used_tb || '0.0'} TB</div>
                            <div className="mt-2 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                <div className="bg-primary h-full rounded-full" style={{ width: nvr.storage_total_tb ? `${Math.round((nvr.storage_used_tb / nvr.storage_total_tb) * 100)}%` : '0%' }} />
                            </div>
                            <p className="text-[10px] md:text-xs text-muted-foreground mt-1">of {nvr.storage_total_tb || '0.0'} TB total capacity</p>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs md:text-sm font-medium">Network Link</CardTitle>
                            <Wifi className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl md:text-2xl font-bold">{nvr.network_bandwidth_mbps || '0.0'} Mbps</div>
                            <p className="text-[10px] md:text-xs text-muted-foreground">Stable Connection</p>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs md:text-sm font-medium">System CPU</CardTitle>
                            <Cpu className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl md:text-2xl font-bold">{nvr.cpu_usage_pct || '0'}%</div>
                            <p className="text-[10px] md:text-xs text-muted-foreground">Normal operating range</p>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs md:text-sm font-medium">Recording</CardTitle>
                            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl md:text-2xl font-bold">{channels} CH</div>
                            <p className="text-[10px] md:text-xs text-muted-foreground">Channels integrated</p>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="p-8 text-center bg-muted/20 border rounded-xl">
                    <h3 className="text-lg font-medium">NVR Belum Dikonfigurasi</h3>
                    <p className="text-sm text-muted-foreground mt-2">Toko ini belum memiliki sistem DVR/NVR yang terhubung ke dashboard.</p>
                </div>
            )}

            {nvr && (
                <div className="bg-secondary/20 p-2 md:p-4 rounded-xl border">
                    <h3 className="mb-4 font-semibold flex items-center justify-between">
                        <span>Live Monitoring ({channels} Channels)</span>
                        <span className="text-xs font-normal text-muted-foreground flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Live Sync
                        </span>
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4">
                        {cameras.map((camera: any) => (
                            <CameraFeed
                                key={camera.id}
                                id={camera.id}
                                name={`CH ${camera.channel_number} - ${camera.name}`}
                                isOffline={camera.is_offline}
                            />
                        ))}
                        {cameras.length === 0 && (
                            <div className="col-span-full py-12 text-center text-muted-foreground">
                                Belum ada kamera yang ditambahkan ke NVR ini.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
