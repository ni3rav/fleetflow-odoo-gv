import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CopyPlus } from "lucide-react";

export function DispatchPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Dispatch</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Create and assign new trips to available vehicles and drivers.
          </p>
        </div>
      </div>

      <Card className="border-border/50 max-w-2xl bg-card shadow-sm">
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <CopyPlus className="h-5 w-5 text-primary" />
            Create New Trip
          </CardTitle>
          <CardDescription>Fill out the details below to assign a new dispatch.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col h-48 items-center justify-center border border-dashed border-border/60 rounded-lg text-muted-foreground bg-muted/10">
            <p className="font-medium text-foreground/70 mb-1">Dispatch Form Ready</p>
            <p className="text-sm">Validation & Workflow logic will be implemented here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
