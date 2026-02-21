import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CopyPlus, Map, Pencil, Loader2 } from "lucide-react";
import { TripCreationForm } from "./trip-creation-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Trip = {
  id: string;
  vehicleId: string;
  driverId: string;
  cargoWeightKg: number;
  originAddress: string;
  destination: string;
  status: "draft" | "dispatched" | "completed" | "cancelled";
  startOdometer?: number;
  endOdometer?: number | null;
  estimatedFuelCost?: string | null;
  actualFuelCost?: string | null;
  createdAt: string;
};

export function DispatchPage() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [editStatus, setEditStatus] = useState<string>("");
  const [editEndOdometer, setEditEndOdometer] = useState<string>("");
  const [editActualFuelCost, setEditActualFuelCost] = useState<string>("");

  const { data: trips = [], isLoading: loadingTrips } = useQuery({
    queryKey: ["trips"],
    queryFn: () => api.get<Trip[]>("/api/trips"),
  });

  const { data: vehicles = [], isLoading: loadingVehicles } = useQuery({
    queryKey: ["vehicles"],
    queryFn: () => api.get<any[]>("/api/vehicles"),
  });

  const { data: drivers = [], isLoading: loadingDrivers } = useQuery({
    queryKey: ["drivers"],
    queryFn: () => api.get<any[]>("/api/drivers"),
  });

  const isLoading = loadingTrips || loadingVehicles || loadingDrivers;

  const statusMutation = useMutation({
    mutationFn: ({
      id,
      status,
      endOdometer,
      actualFuelCost,
    }: {
      id: string;
      status: string;
      endOdometer?: number;
      actualFuelCost?: string;
    }) =>
      api.patch(`/api/trips/${id}/status`, {
        status,
        ...(endOdometer !== undefined && { endOdometer }),
        ...(actualFuelCost !== undefined && actualFuelCost !== "" && { actualFuelCost }),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      toast.success(
        variables.status === "completed"
          ? "Trip completed"
          : variables.status === "cancelled"
            ? "Trip cancelled"
            : "Trip status updated",
      );
      setEditingTrip(null);
      setEditStatus("");
      setEditEndOdometer("");
      setEditActualFuelCost("");
    },
    onError: (err: unknown) =>
      toast.error(
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
          "Failed to update trip",
      ),
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

  const handleOpenEdit = (trip: Trip) => {
    setEditingTrip(trip);
    const nextStatus = trip.status === "draft" ? "dispatched" : "completed";
    setEditStatus(nextStatus);
    setEditEndOdometer(trip.endOdometer != null ? String(trip.endOdometer) : "");
    setEditActualFuelCost(trip.actualFuelCost ?? "");
  };

  const handleEditSubmit = () => {
    if (!editingTrip) return;
    const status = editStatus as Trip["status"];
    if (status === editingTrip.status) {
      setEditingTrip(null);
      setEditStatus("");
      setEditEndOdometer("");
      setEditActualFuelCost("");
      return;
    }
    if (status === "completed") {
      const endOdometer = parseInt(editEndOdometer, 10);
      if (Number.isNaN(endOdometer) || endOdometer < 0) {
        toast.error("Enter a valid end odometer reading");
        return;
      }
      statusMutation.mutate({
        id: editingTrip.id,
        status: "completed",
        endOdometer,
        actualFuelCost: editActualFuelCost.trim() || undefined,
      });
    } else {
      statusMutation.mutate({ id: editingTrip.id, status });
    }
  };

  const canEditTrip = (trip: Trip) =>
    trip.status === "draft" || trip.status === "dispatched";
  const editStatusOptions: { value: string; label: string }[] =
    editingTrip?.status === "draft"
      ? [
          { value: "draft", label: "Draft (no change)" },
          { value: "dispatched", label: "Dispatched" },
          { value: "completed", label: "Completed" },
          { value: "cancelled", label: "Cancelled" },
        ]
      : editingTrip?.status === "dispatched"
        ? [
            { value: "dispatched", label: "Dispatched (no change)" },
            { value: "completed", label: "Completed" },
            { value: "cancelled", label: "Cancelled" },
          ]
        : [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Dispatch</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Create and assign new trips to available vehicles and drivers.
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="gap-2">
          <CopyPlus className="h-4 w-4" />
          New Dispatch
        </Button>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Trip</DialogTitle>
            <DialogDescription>Fill out the details below to assign a new dispatch.</DialogDescription>
          </DialogHeader>
          <TripCreationForm onSuccess={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingTrip}
        onOpenChange={(open) => {
          if (!open) {
            setEditingTrip(null);
            setEditStatus("");
            setEditEndOdometer("");
            setEditActualFuelCost("");
          }
        }}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Edit trip — update status</DialogTitle>
            <DialogDescription>
              {editingTrip?.status === "draft"
                ? "Dispatch this trip or cancel it."
                : "Complete the trip (enter end odometer) or cancel it."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>New status</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {editStatusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {editStatus === "completed" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="edit-end-odometer">End odometer (km) *</Label>
                  <Input
                    id="edit-end-odometer"
                    type="number"
                    min={editingTrip?.startOdometer ?? 0}
                    placeholder="e.g. 45280"
                    value={editEndOdometer}
                    onChange={(e) => setEditEndOdometer(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-actual-fuel">Actual fuel cost (₹, optional)</Label>
                  <Input
                    id="edit-actual-fuel"
                    type="text"
                    placeholder="e.g. 2500"
                    value={editActualFuelCost}
                    onChange={(e) => setEditActualFuelCost(e.target.value)}
                  />
                </div>
              </>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingTrip(null);
                  setEditStatus("");
                  setEditEndOdometer("");
                  setEditActualFuelCost("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditSubmit}
                disabled={
                  statusMutation.isPending ||
                  !editStatus ||
                  (editStatus === "completed" &&
                    (editEndOdometer === "" || Number.isNaN(parseInt(editEndOdometer, 10))))
                }
              >
                {statusMutation.isPending && statusMutation.variables?.id === editingTrip?.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Update"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 gap-6">

        <Card className="border-border/50 bg-card shadow-sm overflow-hidden">
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
                    <TableHead className="text-right w-[100px]">Actions</TableHead>
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
                        <TableCell className="text-right"><Skeleton className="h-8 w-8" /></TableCell>
                      </TableRow>
                    ))
                  ) : trips.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
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
                            <span className="font-medium">
                              {trip.vehicleId
                                ? vehicles.find(v => v.id === trip.vehicleId)?.name || "Unknown Vehicle"
                                : "Unknown Vehicle"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {trip.driverId
                                ? drivers.find(d => d.id === trip.driverId)?.name || "Unknown Driver"
                                : "Unknown Driver"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{trip.cargoWeightKg}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(trip.status)} variant="outline">
                            {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {canEditTrip(trip) ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleOpenEdit(trip)}
                              disabled={statusMutation.isPending && statusMutation.variables?.id === trip.id}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit trip</span>
                            </Button>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
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
