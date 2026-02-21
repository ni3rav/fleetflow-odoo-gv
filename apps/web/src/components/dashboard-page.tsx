import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { Truck, AlertTriangle, CheckCircle, Package } from "lucide-react";

export function DashboardPage() {
  const { data: session } = authClient.useSession();

  const stats = [
    {
      title: "Active Fleet",
      value: "14",
      description: "Count of vehicles currently 'On Trip'",
      icon: Truck,
      trend: "+2 from yesterday"
    },
    {
      title: "Maintenance Alerts",
      value: "3",
      description: "Vehicles marked 'In Shop'",
      icon: AlertTriangle,
      trend: "Requires attention"
    },
    {
      title: "Utilization Rate",
      value: "82%",
      description: "% of fleet assigned vs. idle",
      icon: CheckCircle,
      trend: "+5% this week"
    },
    {
      title: "Pending Cargo",
      value: "8",
      description: "Shipments waiting for assignment",
      icon: Package,
      trend: "-2 from yesterday"
    }
  ]

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Command Center</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Welcome back, <span className="font-medium text-foreground">{session?.user.name || session?.user.email || "Dispatcher"}</span>. Here is what's happening today.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <Card key={idx} className="border-border/50 bg-card shadow-sm transition-all hover:shadow-md hover:border-border cursor-default group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {stat.title}
              </CardTitle>
              <div className="p-2 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                <stat.icon className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-border/50 shadow-sm bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Recent Dispatches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground flex flex-col items-center justify-center p-8 border border-dashed rounded-lg bg-muted/30">
              <Package className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p>Dispatcher Table Component Will Go Here</p>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 border-border/50 shadow-sm bg-card">
          <CardHeader>
            <CardTitle className="text-lg">In-Shop Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground flex flex-col items-center justify-center p-8 border border-dashed rounded-lg bg-muted/30">
              <AlertTriangle className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p>Maintenance List Component Will Go Here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
