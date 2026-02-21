import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Loader2, Truck } from "lucide-react";

import { api } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Vehicle = {
  id: string;
  licensePlate: string;
  name: string;
  model: string;
  type: "truck" | "van" | "bike";
  maxCapacityKg: number;
  odometer: number;
  status: "available" | "on_trip" | "in_shop" | "retired";
  createdAt: string;
  updatedAt: string;
};

const vehicleSchema = z.object({
  licensePlate: z.string().min(1, "License plate is required"),
  name: z.string().min(1, "Name is required"),
  model: z.string().min(1, "Model is required"),
  type: z.enum(["truck", "van", "bike"], { message: "Please select a type" }),
  maxCapacityKg: z.coerce.number().min(1, "Capacity must be greater than 0"),
  odometer: z.coerce.number().min(0, "Odometer cannot be negative").default(0),
});

type VehicleFormValues = z.infer<typeof vehicleSchema>;

export function VehicleRegistryPage() {
  const queryClient = useQueryClient();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingVehicleId, setDeletingVehicleId] = useState<string | null>(null);

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ["vehicles"],
    queryFn: () => api.get<Vehicle[]>("/api/vehicles"),
  });

  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema) as any,
    defaultValues: {
      licensePlate: "",
      name: "",
      model: "",
      type: "truck",
      maxCapacityKg: 0,
      odometer: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: VehicleFormValues) => api.post("/api/vehicles", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Vehicle added successfully!");
      setIsSheetOpen(false);
    },
    onError: (err: Error) => toast.error(err.message || "Failed to add vehicle"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; values: VehicleFormValues }) =>
      api.put(`/api/vehicles/${data.id}`, data.values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Vehicle updated successfully!");
      setIsSheetOpen(false);
    },
    onError: (err: Error) => toast.error(err.message || "Failed to update vehicle"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/vehicles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Vehicle deleted successfully!");
      setIsDeleteDialogOpen(false);
    },
    onError: (err: Error) => toast.error(err.message || "Failed to delete vehicle"),
  });

  const onSubmit = (values: VehicleFormValues) => {
    if (editingVehicle) {
      updateMutation.mutate({ id: editingVehicle.id, values });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleOpenAdd = () => {
    setEditingVehicle(null);
    form.reset({
      licensePlate: "",
      name: "",
      model: "",
      type: "truck",
      maxCapacityKg: 0,
      odometer: 0,
    });
    setIsSheetOpen(true);
  };

  const handleOpenEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    form.reset({
      licensePlate: vehicle.licensePlate,
      name: vehicle.name,
      model: vehicle.model,
      type: vehicle.type,
      maxCapacityKg: vehicle.maxCapacityKg,
      odometer: vehicle.odometer,
    });
    setIsSheetOpen(true);
  };

  const handleOpenDelete = (id: string) => {
    setDeletingVehicleId(id);
    setIsDeleteDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-emerald-500/20";
      case "on_trip":
        return "bg-blue-500/15 text-blue-600 hover:bg-blue-500/25 border-blue-500/20";
      case "in_shop":
        return "bg-amber-500/15 text-amber-600 hover:bg-amber-500/25 border-amber-500/20";
      case "retired":
        return "bg-destructive/15 text-destructive hover:bg-destructive/25 border-destructive/20";
      default:
        return "bg-muted text-muted-foreground border-border/50";
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Vehicle Registry</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your fleet physical assets, verify capacities, and check availability statuses.
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Add Vehicle
        </Button>
      </div>

      <Card className="border-border/50 shadow-sm bg-card overflow-hidden">
        <CardHeader className="bg-muted/10 border-b border-border/50 pb-4">
          <CardTitle className="text-lg">Fleet Overview</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>License Plate</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Model / Type</TableHead>
                <TableHead>Max Capacity</TableHead>
                <TableHead>Odometer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto flex-shrink-0" /></TableCell>
                  </TableRow>
                ))
              ) : vehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Truck className="h-8 w-8 text-muted-foreground/50" />
                      <p>No vehicles yet. Add your first vehicle.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                vehicles.map((v) => (
                  <TableRow key={v.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">{v.licensePlate}</TableCell>
                    <TableCell>{v.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{v.model}</span>
                        <span className="text-xs text-muted-foreground capitalize">{v.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>{v.maxCapacityKg} kg</TableCell>
                    <TableCell>{v.odometer.toLocaleString()} km</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(v.status)} variant="outline">
                        {formatStatus(v.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                          onClick={() => handleOpenEdit(v)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleOpenDelete(v.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add / Edit Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingVehicle ? "Edit Vehicle" : "Add Vehicle"}</SheetTitle>
            <SheetDescription>
              {editingVehicle ? "Update vehicle details." : "Register a new vehicle in the system."}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="licensePlate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>License Plate</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. XYZ-1234" disabled={isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Delivery Van 1" disabled={isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Ford Transit" disabled={isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isPending}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="truck">Truck</SelectItem>
                          <SelectItem value="van">Van</SelectItem>
                          <SelectItem value="bike">Bike</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxCapacityKg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Capacity (kg)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" disabled={isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="odometer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Odometer (km)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" disabled={isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full mt-4" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingVehicle ? "Save Changes" : "Create Vehicle"}
                </Button>
              </form>
            </Form>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the vehicle
              and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingVehicleId && deleteMutation.mutate(deletingVehicleId)}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
