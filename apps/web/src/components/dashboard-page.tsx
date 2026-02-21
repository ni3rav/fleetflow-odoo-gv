import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { api } from "@/lib/api-client";
import { Truck, AlertTriangle, CheckCircle, Package, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

type Vehicle = { id: string; name: string; licensePlate: string; status: string };
type Trip = { id: string; originAddress: string; destination: string; status: string; vehicle: { name: string }; driver: { name: string }; createdAt: string };
type MaintenanceLog = { id: string; vehicle: { name: string; licensePlate: string }; description: string; status: string; date: string };

export function DashboardPage() {
  const { data: session } = authClient.useSession();

  const { data: vehicles = [], isLoading: loadingVeh } = useQuery({
    queryKey: ["vehicles"],
    queryFn: () => api.get<Vehicle[]>("/api/vehicles"),
  });

  const { data: trips = [], isLoading: loadingTrips } = useQuery({
    queryKey: ["trips"],
    queryFn: () => api.get<Trip[]>("/api/trips"),
  });

  const { data: maintenance = [], isLoading: loadingMaint } = useQuery({
    queryKey: ["maintenance"],
    queryFn: () => api.get<MaintenanceLog[]>("/api/maintenance"),
  });

  const isLoading = loadingVeh || loadingTrips || loadingMaint;

  const activeFleetCount = vehicles.filter(v => v.status === "on_trip").length;
  const inShopCount = vehicles.filter(v => v.status === "in_shop").length;
  const availableCount = vehicles.filter(v => v.status === "available").length;
  const totalVehicles = vehicles.length;

  const utilizationRate = totalVehicles > 0
    ? Math.round(((activeFleetCount + availableCount) / totalVehicles) * 100)
    : 0;

  const recentDispatches = [...trips]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const activeMaintenance = maintenance.filter(m => m.status !== "completed").slice(0, 5);

  const stats = [
    {
      title: "Active Fleet",
      value: isLoading ? "-" : activeFleetCount.toString(),
      description: "Count of vehicles currently 'On Trip'",
      icon: Truck,
      trend: "Currently deployed"
    },
    {
      title: "Maintenance Alerts",
      value: isLoading ? "-" : inShopCount.toString(),
      description: "Vehicles marked 'In Shop'",
      icon: AlertTriangle,
      trend: activeMaintenance.length > 0 ? "Requires attention" : "All clear"
    },
    {
      title: "Utilization Rate",
      value: isLoading ? "-" : `${utilizationRate}%`,
      description: "% of fleet available or on trip",
      icon: CheckCircle,
      trend: "Operational health"
    },
    {
      title: "Total Trips Today",
      value: isLoading ? "-" : trips.filter(t => new Date(t.createdAt).toDateString() === new Date().toDateString()).length.toString(),
      description: "Trips logged today",
      icon: Package,
      trend: "Daily velocity"
    }
  ];

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-wider text-foreground">Command Center</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Welcome back, <span className="font-medium text-foreground">{session?.user.name || session?.user.email || "Dispatcher"}</span>. Here is what's happening today.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <Card key={idx} className="border-border/60 bg-card shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-default group rounded-xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 bg-muted/20">
              <CardTitle className="text-sm font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                {stat.title}
              </CardTitle>
              <div className="p-2.5 bg-background shadow-sm rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors border border-border/50">
                <stat.icon className="h-4 w-4 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-4xl font-extrabold tracking-tight text-foreground">
                {isLoading ? <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /> : stat.value}
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1 font-medium select-none">
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-border/60 shadow-sm bg-card rounded-xl overflow-hidden flex flex-col">
          <CardHeader className="border-b border-border/40 bg-muted/10 shrink-0">
            <CardTitle className="text-lg font-semibold text-foreground/90">Recent Dispatches</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead>Vehicle & Driver</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                    </TableRow>
                  ))
                ) : recentDispatches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                      No recent dispatches.
                    </TableCell>
                  </TableRow>
                ) : (
                  recentDispatches.map((trip) => (
                    <TableRow key={trip.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm truncate max-w-[150px]">{trip.originAddress || "HQ"}</span>
                          <span className="text-muted-foreground text-xs mt-0.5">↓</span>
                          <span className="font-medium text-sm truncate max-w-[150px]">{trip.destination}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-sm">
                          <span className="font-medium">{trip.vehicle?.name || "Unknown"}</span>
                          <span className="text-xs text-muted-foreground">{trip.driver?.name || "Unknown"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          trip.status === "completed" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                            trip.status === "dispatched" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                              "bg-muted text-muted-foreground border-border/50"
                        }>
                          {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="col-span-3 border-border/60 shadow-sm bg-card rounded-xl overflow-hidden flex flex-col">
          <CardHeader className="border-b border-border/40 bg-muted/10 shrink-0">
            <CardTitle className="text-lg font-semibold text-foreground/90">In-Shop Vehicles</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Issue / Task</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    </TableRow>
                  ))
                ) : activeMaintenance.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="h-32 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <CheckCircle className="h-6 w-6 text-emerald-500/60" />
                        <p>No vehicles currently in shop.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  activeMaintenance.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>
                        <div className="font-medium text-sm">{m.vehicle?.name || "Unknown"}</div>
                        <div className="text-xs text-muted-foreground">{m.vehicle?.licensePlate}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm truncate max-w-[150px]" title={m.description}>
                          {m.description}
                        </div>
                        <div className="text-xs text-amber-500 mt-0.5">
                          Since {new Date(m.date).toLocaleDateString()}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
