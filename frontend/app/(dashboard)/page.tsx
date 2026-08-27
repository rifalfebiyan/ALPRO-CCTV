import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Activity, Video, HardDrive, ShieldAlert, BarChart3 } from "lucide-react"

export default function DashboardOverview() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">215</div>
            <p className="text-xs text-muted-foreground">+3 from last month</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cameras</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,904</div>
            <p className="text-xs text-muted-foreground">98.5% system uptime</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-red-200 dark:border-red-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Alerts</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">12</div>
            <p className="text-xs text-muted-foreground">Requires immediate attention</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Health</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">Average capacity remaining</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle>System Activity</CardTitle>
            <CardDescription>Network and recording status across all regions.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground bg-muted/20 rounded-md border border-dashed m-4">
              <BarChart3 className="w-12 h-12 mb-2 opacity-50" />
              <span className="text-sm opacity-50">Activity Chart Not Configured</span>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
            <CardDescription>Stores requiring technical attention.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { name: "Store Alpha (JKT-01)", issue: "NVR Offline", time: "10 mins ago", severity: "high" },
                { name: "Store Beta (SBY-42)", issue: "Camera 3 Video Loss", time: "25 mins ago", severity: "medium" },
                { name: "Store Gamma (BDG-11)", issue: "Storage 95% Full", time: "1 hr ago", severity: "low" },
                { name: "Store Delta (MDN-05)", issue: "Network Latency >500ms", time: "2 hrs ago", severity: "low" },
              ].map((alert, i) => (
                <div key={i} className="flex items-center">
                  <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                    <ShieldAlert className={`h-4 w-4 ${alert.severity === 'high' ? 'text-red-500' : alert.severity === 'medium' ? 'text-orange-500' : 'text-yellow-500'}`} />
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{alert.name}</p>
                    <p className="text-sm text-muted-foreground">{alert.issue}</p>
                  </div>
                  <div className="ml-auto font-medium text-xs text-muted-foreground">
                    {alert.time}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
