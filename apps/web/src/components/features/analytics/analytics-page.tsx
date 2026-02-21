import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, DollarSign, Activity, PieChart as PieChartIcon, Wrench } from "lucide-react";
import { api } from "@/lib/api-client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

type Expense = {
  id: string;
  amount: string;
  category: string;
  date: string;
};

type MaintenanceLog = {
  id: string;
  cost: string;
  serviceType: string;
  date: string;
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

export function AnalyticsPage() {
  const { data: expenses = [], isLoading: loadingExp } = useQuery({
    queryKey: ["expenses"],
    queryFn: () => api.get<Expense[]>("/api/expenses"),
  });

  const { data: maintenance = [], isLoading: loadingMaint } = useQuery({
    queryKey: ["maintenance"],
    queryFn: () => api.get<MaintenanceLog[]>("/api/maintenance"),
  });

  const isLoading = loadingExp || loadingMaint;

  // Process data for charts
  const expenseByCategory = expenses.reduce((acc, curr) => {
    const amount = Number(curr.amount);
    acc[curr.category] = (acc[curr.category] || 0) + amount;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  })).sort((a, b) => b.value - a.value);

  // Maintenance by type
  const maintByType = maintenance.reduce((acc, curr) => {
    const cost = Number(curr.cost || 0);
    const type = curr.serviceType;
    acc[type] = (acc[type] || 0) + cost;
    return acc;
  }, {} as Record<string, number>);

  const maintBarData = Object.entries(maintByType).map(([name, totalCost]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    totalCost
  }));

  // Total sums
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalMaintenance = maintenance.reduce((sum, m) => sum + Number(m.cost || 0), 0);
  const grandTotal = totalExpenses + totalMaintenance;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Operational Analytics</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Data-driven decision making, Cost Analysis, and Fleet Maintenance Reports.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-border/60 bg-card shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Operational Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-24" /> : `$${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Combined expenses & maintenance</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Direct Expenses</CardTitle>
            <Activity className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {isLoading ? <Skeleton className="h-8 w-24" /> : `$${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Fuel, tolls, and other daily costs</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Maintenance Costs</CardTitle>
            <Wrench className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {isLoading ? <Skeleton className="h-8 w-24" /> : `$${totalMaintenance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Repairs and preventative service</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/60 bg-card shadow-sm rounded-xl overflow-hidden flex flex-col">
          <CardHeader className="border-b border-border/40 bg-muted/10 shrink-0">
            <CardTitle className="text-lg flex items-center gap-2 font-semibold">
              <PieChartIcon className="h-5 w-5 text-primary" />
              Expenses by Category
            </CardTitle>
            <CardDescription>Breakdown of standard operating expenses.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 flex-1 min-h-[350px]">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <Skeleton className="h-[250px] w-[250px] rounded-full" />
              </div>
            ) : pieData.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                <PieChartIcon className="h-10 w-10 opacity-20 mb-4" />
                <p>No expense data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value: any) => `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card shadow-sm rounded-xl overflow-hidden flex flex-col">
          <CardHeader className="border-b border-border/40 bg-muted/10 shrink-0">
            <CardTitle className="text-lg flex items-center gap-2 font-semibold">
              <BarChart3 className="h-5 w-5 text-primary" />
              Maintenance Spend by Type
            </CardTitle>
            <CardDescription>Aggregate repair and preventative costs.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 flex-1 min-h-[350px]">
            {isLoading ? (
              <div className="flex h-full items-end justify-center gap-4 pb-4">
                <Skeleton className="h-[100px] w-16" />
                <Skeleton className="h-[200px] w-16" />
                <Skeleton className="h-[150px] w-16" />
              </div>
            ) : maintBarData.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                <BarChart3 className="h-10 w-10 opacity-20 mb-4" />
                <p>No maintenance data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={maintBarData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.2} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis
                    tickFormatter={(value) => `$${value}`}
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    dx={-10}
                  />
                  <RechartsTooltip
                    formatter={(value: any) => `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="totalCost" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={60}>
                    {maintBarData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
