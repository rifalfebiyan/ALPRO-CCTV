import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Activity, Video, HardDrive, ShieldAlert, BarChart3, WifiOff } from "lucide-react"
import { createClient } from "@/lib/server"
import { formatDistanceToNow } from "date-fns"
import { id as idLocale } from "date-fns/locale"

export const dynamic = 'force-dynamic'

export default async function DashboardOverview() {
  const supabase = await createClient()

  // 1. Fetch Total Stores
  const { count: totalStores } = await supabase
    .from('stores')
    .select('*', { count: 'exact', head: true })

  // 2. Fetch Active Cameras
  const { count: activeCameras } = await supabase
    .from('cameras')
    .select('*', { count: 'exact', head: true })
    .eq('is_offline', false)

  const { count: totalCams } = await supabase
    .from('cameras')
    .select('*', { count: 'exact', head: true })

  const uptimePercent = totalCams && totalCams > 0
    ? (((activeCameras || 0) / totalCams) * 100).toFixed(1)
    : 100

  // 3. System Alerts (CCTV + IoT Alarm)
  const { count: cctvAlerts } = await supabase
    .from('alerts')
    .select('*', { count: 'exact', head: true })
    .eq('is_resolved', false)

  const { data: iotRaw } = await supabase
    .from('iot_alarms')
    .select('status')

  const iotStats = { alarm: 0, siaga: 0, online: 0, offline: 0, etc: 0 }
  let totalIoT = 0
  let iotAlarmsCount = 0

  iotRaw?.forEach(i => {
    totalIoT++
    if (i.status === 'ALARM!!') {
      iotStats.alarm++
      iotAlarmsCount++
    }
    else if (i.status === 'SIAGA') iotStats.siaga++
    else if (i.status === 'ONLINE' || i.status === 'CONNECTED') iotStats.online++
    else if (i.status === 'OFFLINE' || i.status === 'TIMEOUT') iotStats.offline++
    else iotStats.etc++
  })

  const totalAlerts = (cctvAlerts || 0) + iotAlarmsCount

  // 4. Storage Health Breakdown
  const { data: nvrs } = await supabase
    .from('nvrs')
    .select('storage_total_tb, storage_used_tb')

  let totalStorage = 0
  let usedStorage = 0
  nvrs?.forEach(nvr => {
    totalStorage += Number(nvr.storage_total_tb || 0)
    usedStorage += Number(nvr.storage_used_tb || 0)
  })

  // Health is remaining storage percentage
  const storageHealth = totalStorage > 0
    ? Math.round(((totalStorage - usedStorage) / totalStorage) * 100)
    : 100

  // 5. Recent Alerts (Top 5 CCTV Alerts)
  const { data: recentAlerts } = await supabase
    .from('alerts')
    .select(`
            id, issue_description, severity, created_at,
            stores ( name, store_code )
        `)
    .eq('is_resolved', false)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between space-y-2 relative z-10">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 relative z-10">
        <Card className="shadow-sm bg-card/60 backdrop-blur-md border-border/50 hover:bg-card/80 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-sans">{totalStores || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Cabang terdaftar</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm bg-card/60 backdrop-blur-md border-border/50 hover:bg-card/80 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cameras</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-sans">{activeCameras || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">{uptimePercent}% system uptime</p>
          </CardContent>
        </Card>
        <Card className={totalAlerts > 0 ? "relative shadow-sm bg-red-500/5 border-red-500/20 hover:bg-red-500/10 transition-all duration-300" : "shadow-sm bg-card/60 backdrop-blur-md border-border/50 hover:bg-card/80 transition-all duration-300"}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Alerts</CardTitle>
            <AlertCircle className={`h-4 w-4 ${totalAlerts > 0 ? 'text-red-500 animate-pulse' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold font-sans ${totalAlerts > 0 ? 'text-red-500' : ''}`}>{totalAlerts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalAlerts > 0 ? "Requires immediate attention" : "All systems operational"}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm bg-card/60 backdrop-blur-md border-border/50 hover:bg-card/80 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Health</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-sans">{storageHealth}%</div>
            <p className="text-xs text-muted-foreground mt-1">Average capacity remaining</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 relative z-10">
        <Card className="col-span-4 shadow-sm bg-card/60 backdrop-blur-md border-border/50">
          <CardHeader>
            <CardTitle>Status Perangkat IoT Alarm</CardTitle>
            <CardDescription>Rangkuman konektivitas seluruh sensor alarm ESP32 di berbagai cabang.</CardDescription>
          </CardHeader>
          <CardContent className="h-full pb-6">
            <div className="flex flex-col h-[280px] bg-background/50 p-6 rounded-xl border border-border/50 shadow-inner">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Metrik Agregat Status</span>
                <span className="text-sm font-bold">{totalIoT} ESP32 Aktif</span>
              </div>

              {/* Segmented Progress Bar */}
              <div className="w-full h-10 rounded-full overflow-hidden flex bg-muted/30 mb-8 border border-border/50 shadow-sm relative">
                {totalIoT > 0 ? (
                  <>
                    {iotStats.alarm > 0 && <div style={{ width: `${(iotStats.alarm / totalIoT) * 100}%` }} className="bg-red-500 hover:opacity-80 transition-opacity cursor-help" title={`${iotStats.alarm} Alarm Menyala`} />}
                    {iotStats.siaga > 0 && <div style={{ width: `${(iotStats.siaga / totalIoT) * 100}%` }} className="bg-emerald-500 hover:opacity-80 transition-opacity cursor-help" title={`${iotStats.siaga} Siaga (Armed)`} />}
                    {iotStats.online > 0 && <div style={{ width: `${(iotStats.online / totalIoT) * 100}%` }} className="bg-teal-400 hover:opacity-80 transition-opacity cursor-help" title={`${iotStats.online} Online (Standby)`} />}
                    {iotStats.offline > 0 && <div style={{ width: `${(iotStats.offline / totalIoT) * 100}%` }} className="bg-zinc-600 hover:opacity-80 transition-opacity cursor-help" title={`${iotStats.offline} Offline / Timeout`} />}
                    {iotStats.etc > 0 && <div style={{ width: `${(iotStats.etc / totalIoT) * 100}%` }} className="bg-amber-500 hover:opacity-80 transition-opacity cursor-help" title={`${iotStats.etc} Pending / Lainnya`} />}
                  </>
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
                    Data Kosong
                  </div>
                )}
              </div>

              {/* Legends / Scorecards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-auto">
                <div className="flex flex-col space-y-0.5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 shadow-sm">
                  <div className="flex items-center gap-1.5 opacity-90">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] font-bold tracking-wider uppercase text-red-600 dark:text-red-400">🚨 ALARM OFFENSE</span>
                  </div>
                  <span className="text-2xl font-black font-sans text-red-700 dark:text-red-500">{iotStats.alarm}</span>
                </div>

                <div className="flex flex-col space-y-0.5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 shadow-sm">
                  <div className="flex items-center gap-1.5 opacity-90">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-600 dark:text-emerald-400">🛡️ ARMED (SIAGA)</span>
                  </div>
                  <span className="text-2xl font-black font-sans text-emerald-700 dark:text-emerald-500">{iotStats.siaga}</span>
                </div>

                <div className="flex flex-col space-y-0.5 p-3 rounded-lg bg-teal-500/10 border border-teal-500/20 shadow-sm">
                  <div className="flex items-center gap-1.5 opacity-90">
                    <div className="w-2 h-2 rounded-full bg-teal-500" />
                    <span className="text-[10px] font-bold tracking-wider uppercase text-teal-600 dark:text-teal-400">🟢 ONLINE (STANDBY)</span>
                  </div>
                  <span className="text-2xl font-black font-sans text-teal-700 dark:text-teal-500">{iotStats.online}</span>
                </div>

                <div className="flex flex-col space-y-0.5 p-3 rounded-lg bg-zinc-500/10 border border-border/60 shadow-sm">
                  <div className="flex items-center gap-1.5 opacity-90">
                    <div className="w-2 h-2 rounded-full bg-zinc-600 dark:bg-zinc-400" />
                    <span className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground">❌ OFFLINE (RTO)</span>
                  </div>
                  <span className="text-2xl font-black font-sans text-foreground/80">{iotStats.offline}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3 shadow-sm bg-card/60 backdrop-blur-md border-border/50">
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
            <CardDescription>Stores requiring technical attention.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {(!recentAlerts || recentAlerts.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
                    <AlertCircle className="w-6 h-6 text-emerald-500" />
                  </div>
                  <p className="text-sm font-medium">Bebas Kendala</p>
                  <p className="text-xs">Tidak ada insiden tercatat saat ini.</p>
                </div>
              ) : (
                recentAlerts.map((alert: any) => {
                  const storeNameObj = alert.stores as { name: string, store_code: string } | null
                  const storeName = storeNameObj ? `${storeNameObj.name} (${storeNameObj.store_code})` : "Toko Tidak Diketahui"

                  let severityStyle = 'text-yellow-500'
                  let severityBgStyle = 'bg-yellow-500/10 border-yellow-500/20'
                  if (alert.severity === 'high') {
                    severityStyle = 'text-red-500'
                    severityBgStyle = 'bg-red-500/10 border-red-500/20'
                  } else if (alert.severity === 'medium') {
                    severityStyle = 'text-orange-500'
                    severityBgStyle = 'bg-orange-500/10 border-orange-500/20'
                  }

                  return (
                    <div key={alert.id} className="flex items-center group">
                      <div className={`h-10 w-10 rounded-full border flex items-center justify-center shrink-0 transition-colors ${severityBgStyle}`}>
                        {alert.severity === 'high' ? (
                          <WifiOff className={`h-4 w-4 ${severityStyle}`} />
                        ) : (
                          <ShieldAlert className={`h-4 w-4 ${severityStyle}`} />
                        )}
                      </div>
                      <div className="ml-4 space-y-1 overflow-hidden">
                        <p className="text-sm font-medium leading-none truncate group-hover:text-primary transition-colors">{storeName}</p>
                        <p className="text-sm text-muted-foreground truncate">{alert.issue_description}</p>
                      </div>
                      <div className="ml-auto font-medium text-xs text-muted-foreground whitespace-nowrap pl-4">
                        {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true, locale: idLocale })}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
