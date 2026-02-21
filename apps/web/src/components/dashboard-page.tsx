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
              <div className="text-4xl font-extrabold tracking-tight text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1 font-medium select-none">
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-border/60 shadow-sm bg-card rounded-xl">
          <CardHeader className="border-b border-border/40 bg-muted/10">
            <CardTitle className="text-lg font-semibold text-foreground/90">Recent Dispatches</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground flex flex-col items-center justify-center p-12 border border-dashed border-border/60 rounded-xl bg-muted/20">
              <Package className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="font-medium text-foreground/60">Dispatcher Table Component Go Here</p>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 border-border/60 shadow-sm bg-card rounded-xl">
          <CardHeader className="border-b border-border/40 bg-muted/10">
            <CardTitle className="text-lg font-semibold text-foreground/90">In-Shop Vehicles</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground flex flex-col items-center justify-center p-12 border border-dashed border-border/60 rounded-xl bg-muted/20">
              <AlertTriangle className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="font-medium text-foreground/60">Maintenance List Component Go Here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
