import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wrench } from "lucide-react";

export function MaintenancePage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Maintenance Logs</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Track vehicle health, service history, and log preventative services.
          </p>
        </div>
      </div>

      <Card className="border-border/50 bg-card shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/10 border-b border-border/50 pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            Service Records
          </CardTitle>
          <CardDescription>Comprehensive log of all fleet maintenance activities.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col h-64 items-center justify-center border border-dashed border-border/60 rounded-lg text-muted-foreground bg-muted/10">
            <p className="font-medium text-foreground/70 mb-1">Maintenance Table Ready</p>
            <p className="text-sm">Service logs will be listed here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
