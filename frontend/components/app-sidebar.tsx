import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Home, LayoutDashboard, MonitorPlay, Settings, Cctv, Bell } from "lucide-react"
import Link from "next/link"

const SIDEBAR_ITEMS = [
  { name: "Dashboard", href: "/", icon: <LayoutDashboard size={20} /> },
  { name: "Stores", href: "/stores", icon: <Home size={20} /> },
  { name: "IoT Alarm", href: "/alarms", icon: <Bell size={20} /> },
  { name: "Monitoring Viewer", href: "/monitoring", icon: <MonitorPlay size={20} /> },
  { name: "Settings", href: "/settings", icon: <Settings size={20} /> },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2 font-bold text-lg text-primary">
          <Cctv size={24} />
          <span>ALPRO CCTV</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="mt-4">
            {SIDEBAR_ITEMS.map((item) => (
              <SidebarMenuItem title={item.name} key={item.name}>
                <SidebarMenuButton render={<Link href={item.href} />}>
                  {item.icon}
                  <span>{item.name}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="text-xs text-muted-foreground">© 2026 ALPRO</div>
      </SidebarFooter>
    </Sidebar>
  )
}
