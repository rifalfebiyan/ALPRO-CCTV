"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Home, LayoutDashboard, MonitorPlay, Settings, Cctv, Bell, History, ChevronRight } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@radix-ui/react-collapsible"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

const SIDEBAR_ITEMS = [
  { name: "Dashboard", href: "/", icon: <LayoutDashboard size={20} /> },
  { name: "Stores", href: "/stores", icon: <Home size={20} /> },
  { name: "IoT Alarm", href: "/alarms", icon: <Bell size={20} /> },
  { name: "Monitoring Viewer", href: "/monitoring", icon: <MonitorPlay size={20} /> },
  {
    name: "CCTV Master Data",
    href: "/cctv-master-data",
    icon: <Cctv size={20} />,
    subItems: [
      { title: "Table Data", href: "/cctv-master-data" },
      { title: "Map Dashboard", href: "/cctv-master-data/map" }
    ]
  },
  { name: "Audit Logs", href: "/audit-logs", icon: <History size={20} /> },
  { name: "Settings", href: "/settings", icon: <Settings size={20} /> },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="bg-muted/30 border-r border-border/50">
      <SidebarHeader className="p-4 border-b bg-background/50">
        <div className="flex items-center gap-2 font-bold text-lg text-primary">
          <Image src="/logo-alpro.png" alt="ALPRO Logo" width={28} height={28} className="object-contain" />
          <span className="truncate">ALPRO SS</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="mt-4">
            {SIDEBAR_ITEMS.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))

              if (item.subItems) {
                return (
                  <Collapsible key={item.name} asChild defaultOpen={isActive} className="group/collapsible">
                    <SidebarMenuItem title={item.name}>
                      <SidebarMenuButton render={<CollapsibleTrigger />} tooltip={item.name} isActive={pathname === item.href}>
                        {item.icon}
                        <span>{item.name}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.subItems.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton render={<Link href={subItem.href} />} isActive={pathname === subItem.href}>
                                <span>{subItem.title}</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                )
              }

              return (
                <SidebarMenuItem title={item.name} key={item.name}>
                  <SidebarMenuButton render={<Link href={item.href} />} isActive={isActive} tooltip={item.name}>
                    {item.icon}
                    <span>{item.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="text-xs text-muted-foreground">© 2026 ALPRO</div>
      </SidebarFooter>
    </Sidebar>
  )
}
