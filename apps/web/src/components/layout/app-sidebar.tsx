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
} from "@/components/ui/sidebar";
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
} from "@/components/ui/alert-dialog";
import {
  LayoutDashboard,
  Truck,
  CalendarCheck,
  Wrench,
  Receipt,
  Users,
  BarChart3,
  LogOut,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { authClient } from "@/lib/auth-client";

const ROLE_LABELS: Record<string, string> = {
  manager: "Fleet Manager",
  dispatcher: "Dispatcher",
  safety_officer: "Safety Officer",
  analyst: "Financial Analyst",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const items = [
  {
    title: "Command Center",
    url: "/command",
    icon: LayoutDashboard,
  },
  {
    title: "Vehicle Registry",
    url: "/vehicle",
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
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { data: session } = authClient.useSession();

  const handleLogout = async () => {
    await authClient.signOut();
    window.location.href = "/"; // Reload and redirect back to auth
  };

  const userName = session?.user?.name || "User";
  const userRole = (session?.user as { role?: string })?.role || "dispatcher";

  return (
    <Sidebar>
      <SidebarHeader className="h-20 flex flex-row items-center px-6 border-b border-border/50 text-primary font-bold text-xl gap-3">
        <div className="flex items-center justify-center bg-primary text-primary-foreground p-1.5 rounded-lg shadow-sm">
          <Truck className="h-5 w-5" />
        </div>
        <span className="tracking-tight">FleetFlow</span>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5 px-3 mt-4">
              {items.map((item) => {
                const isActive =
                  location.pathname === item.url ||
                  (item.url !== "/" && location.pathname.startsWith(item.url));

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className="rounded-lg h-auto py-2.5 px-3 transition-all hover:bg-primary/10 hover:text-primary data-[active=true]:bg-primary/10 data-[active=true]:text-primary font-medium"
                    >
                      <Link to={item.url} className="flex items-center gap-3">
                        <item.icon className="h-5 w-5 mb-0.5 opacity-80" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
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
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold shrink-0">
                  {getInitials(userName)}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{userName}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {ROLE_LABELS[userRole] || userRole}
                  </span>
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
                    You will be redirected back to the login screen and your
                    session will end.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleLogout}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Ok
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
