import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { LayoutDashboard, Truck, CalendarCheck, Wrench, Receipt, Users, BarChart3, LogOut, User as UserIcon } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { authClient } from "@/lib/auth-client"

const items = [
  {
    title: "Command Center",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Vehicle Registry",
    url: "/fleet",
    icon: Truck,
  },
  {
    title: "Dispatch",
    url: "/dispatch",
    icon: CalendarCheck,
  },
  {
    title: "Maintenance",
    url: "/maintenance",
    icon: Wrench,
  },
  {
    title: "Expenses & Fuel",
    url: "/expenses",
    icon: Receipt,
  },
  {
    title: "Drivers",
    url: "/drivers",
    icon: Users,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  }
]

export function AppSidebar() {
  const location = useLocation()
  const { data: session } = authClient.useSession()

  const handleLogout = async () => {
    await authClient.signOut()
    window.location.href = "/" // Reload and redirect back to auth
  }

  return (
    <Sidebar>
      <SidebarHeader className="h-16 flex flex-row items-center px-4 border-b border-border text-primary font-bold text-xl gap-2">
        <Truck className="h-6 w-6" />
        FleetFlow
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {items.map((item) => {
                const isActive = location.pathname === item.url || (item.url !== "/" && location.pathname.startsWith(item.url))

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <AlertDialog>
              <div className="flex w-full items-center gap-2 rounded-md p-2 text-sidebar-foreground ring-sidebar-ring">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                  <UserIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{session?.user?.name || "Dispatcher"}</span>
                  <span className="truncate text-xs">{(session?.user as { role?: string })?.role || "Admin"}</span>
                </div>
                <AlertDialogTrigger asChild>
                  <button className="flex aspect-square size-8 items-center justify-center rounded-md hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors outline-none focus-visible:ring-2 ring-sidebar-ring">
                    <LogOut className="size-4" />
                    <span className="sr-only">Log out</span>
                  </button>
                </AlertDialogTrigger>
              </div>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure to logout?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will be redirected back to the login screen and your session will end.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Ok
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
