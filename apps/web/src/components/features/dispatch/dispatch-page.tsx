import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CopyPlus, Map } from "lucide-react";
import { TripCreationForm } from "./trip-creation-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type Trip = {
  id: string;
  vehicle: { id: string; name: string; licensePlate: string };
  driver: { id: string; name: string };
  cargoWeightKg: number;
  originAddress: string;
  destination: string;
  status: "draft" | "dispatched" | "completed" | "cancelled";
  createdAt: string;
};

export function DispatchPage() {
  const queryClient = useQueryClient();

  // We could just fetch all trips minus drafts or handled in backend.
  const { data: trips = [], isLoading } = useQuery({
    queryKey: ["trips"],
    queryFn: () => api.get<Trip[]>("/api/trips"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/api/trips/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      toast.success("Trip status updated");
    },
    onError: (err: any) => toast.error(err.response?.data?.error || "Failed to update status"),
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "dispatched":
        return "bg-blue-500/15 text-blue-600 hover:bg-blue-500/25 border-blue-500/20";
      case "completed":
        return "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-emerald-500/20";
      case "cancelled":
        return "bg-destructive/15 text-destructive hover:bg-destructive/25 border-destructive/20";
      default:
        return "bg-muted text-muted-foreground border-border/50";
    }
  };

  const handleStatusChange = (id: string, status: string) => {
    statusMutation.mutate({ id, status });
  };

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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="border-border/50 xl:col-span-1 bg-card shadow-sm h-fit">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <CopyPlus className="h-5 w-5 text-primary" />
              Create New Trip
            </CardTitle>
            <CardDescription>Fill out the details below to assign a new dispatch.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <TripCreationForm />
          </CardContent>
        </Card>

        <Card className="border-border/50 xl:col-span-2 bg-card shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/10 border-b border-border/50 pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Map className="h-5 w-5 text-primary" />
                Active & Recent Trips
              </CardTitle>
              <CardDescription className="mt-1">Real-time overview of fleet deployments.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ["trips"] })}>
              Refresh
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Route</TableHead>
                    <TableHead>Vehicle & Driver</TableHead>
                    <TableHead>Cargo (kg)</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-28 rounded-md" /></TableCell>
                      </TableRow>
                    ))
                  ) : trips.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Map className="h-8 w-8 text-muted-foreground/50" />
                          <p>No trips currently active or logged.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    trips.map((trip) => (
                      <TableRow key={trip.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm truncate max-w-[200px]" title={trip.originAddress}>
                              {trip.originAddress || "HQ"}
                            </span>
                            <span className="text-muted-foreground text-xs mt-0.5">↓</span>
                            <span className="font-medium text-sm truncate max-w-[200px]" title={trip.destination}>
                              {trip.destination}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col text-sm">
                            <span className="font-medium">{trip.vehicle?.name || "Unknown Vehicle"}</span>
                            <span className="text-xs text-muted-foreground">{trip.driver?.name || "Unknown Driver"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{trip.cargoWeightKg}</TableCell>
                        <TableCell>
                          {trip.status === "dispatched" ? (
                            <Select
                              value={trip.status}
                              onValueChange={(val) => handleStatusChange(trip.id, val)}
                              disabled={statusMutation.isPending && statusMutation.variables?.id === trip.id}
                            >
                              <SelectTrigger className="w-[130px] h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="dispatched">Dispatched</SelectItem>
                                <SelectItem value="completed">Complete Trip</SelectItem>
                                <SelectItem value="cancelled">Cancel</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge className={getStatusBadge(trip.status)} variant="outline">
                              {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
