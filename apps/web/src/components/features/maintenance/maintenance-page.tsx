import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Wrench, Plus, Edit, Trash2, Loader2, Calendar, FileText, Settings, IndianRupee, Box } from "lucide-react";

import { api } from "@/lib/api-client";
import { useHasRole } from "@/hooks/use-role";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  name: string;
  licensePlate: string;
  status: string;
};

type MaintenanceLog = {
  id: string;
  vehicle: Vehicle;
  description: string;
  cost: string;
  date: string;
  serviceType: "repair" | "preventative" | "inspection";
  status: "scheduled" | "in_progress" | "completed";
  createdAt: string;
};

const formSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle is required"),
  description: z.string().min(2, "Description is required"),
  cost: z.coerce.number().min(0, "Cost cannot be negative"),
  date: z.string().min(1, "Date is required"),
  serviceType: z.enum(["repair", "preventative", "inspection"], { message: "Select service type" }),
  status: z.enum(["scheduled", "in_progress", "completed"], { message: "Select status" }),
});

type FormValues = z.infer<typeof formSchema>;

export function MaintenancePage() {
  const queryClient = useQueryClient();
  const canManageMaintenance = useHasRole(["manager"]); // backend: create/update = manager only
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<MaintenanceLog | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingLogId, setDeletingLogId] = useState<string | null>(null);

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["maintenance"],
    queryFn: () => api.get<MaintenanceLog[]>("/api/maintenance"),
  });

  const { data: vehicles = [], isLoading: isLoadingVehicles } = useQuery({
    queryKey: ["vehicles"],
    queryFn: () => api.get<Vehicle[]>("/api/vehicles"),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: {
      vehicleId: "",
      description: "",
      cost: 0,
      date: new Date().toISOString().split("T")[0],
      serviceType: "preventative",
      status: "scheduled",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: FormValues) => api.post("/api/maintenance", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] }); // Invalidate vehicles to reflect status change if any
      toast.success("Maintenance log added!");
      setIsDialogOpen(false);
    },
    onError: (err: unknown) =>
      toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to add log"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; values: FormValues }) =>
      api.put(`/api/maintenance/${data.id}`, data.values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Maintenance log updated!");
      setIsDialogOpen(false);
    },
    onError: (err: unknown) =>
      toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to update log"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/maintenance/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Maintenance log deleted!");
      setIsDeleteDialogOpen(false);
    },
    onError: (err: unknown) =>
      toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed to delete log"),
  });

  const onSubmit = (values: FormValues) => {
    if (editingLog) {
      updateMutation.mutate({ id: editingLog.id, values });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleOpenAdd = () => {
    setEditingLog(null);
    form.reset({
      vehicleId: "",
      description: "",
      cost: 0,
      date: new Date().toISOString().split("T")[0],
      serviceType: "preventative",
      status: "scheduled",
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (log: MaintenanceLog) => {
    setEditingLog(log);
    form.reset({
      vehicleId: log.vehicle?.id || "",
      description: log.description,
      cost: Number(log.cost),
      date: new Date(log.date).toISOString().split("T")[0],
      serviceType: log.serviceType,
      status: log.status,
    });
    setIsDialogOpen(true);
  };

  const handleOpenDelete = (id: string) => {
    setDeletingLogId(id);
    setIsDeleteDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500/15 text-emerald-600 border-emerald-500/20";
      case "in_progress":
        return "bg-blue-500/15 text-blue-600 border-blue-500/20";
      case "scheduled":
        return "bg-amber-500/15 text-amber-600 border-amber-500/20";
      default:
        return "bg-muted text-muted-foreground border-border/50";
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "repair":
        return "bg-red-500/15 text-red-600 border-red-500/20";
      case "preventative":
        return "bg-purple-500/15 text-purple-600 border-purple-500/20";
      case "inspection":
        return "bg-indigo-500/15 text-indigo-600 border-indigo-500/20";
      default:
        return "bg-muted text-muted-foreground border-border/50";
    }
  };

  const formatText = (text: string) => {
    return text.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Maintenance Logs</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Track vehicle health, service history, and log preventative services.
          </p>
        </div>
        {canManageMaintenance && (
          <Button onClick={handleOpenAdd} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" /> Log Service
          </Button>
        )}
      </div>

      <Card className="border-border/50 bg-card shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/10 border-b border-border/50 pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            Service Records
          </CardTitle>
          <CardDescription>Comprehensive log of all fleet maintenance activities.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Service Info</TableHead>
                <TableHead>Status & Type</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto shrink-0" /></TableCell>
                  </TableRow>
                ))
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Wrench className="h-8 w-8 text-muted-foreground/50" />
                      <p>No maintenance records found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="whitespace-nowrap">
                      {new Date(log.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{log.vehicle?.name || "Unknown"}</div>
                      <div className="text-xs text-muted-foreground">{log.vehicle?.licensePlate}</div>
                    </TableCell>
                    <TableCell>
                      <div className="truncate max-w-[300px]" title={log.description}>
                        {log.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1.5 items-start">
                        <Badge variant="outline" className={getStatusBadge(log.status)}>
                          {formatText(log.status)}
                        </Badge>
                        <Badge variant="outline" className={getTypeBadge(log.serviceType)}>
                          {formatText(log.serviceType)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-emerald-500">
                      ₹{Number(log.cost).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right">
                      {canManageMaintenance ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                            onClick={() => handleOpenEdit(log)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleOpenDelete(log.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[425px] rounded-2xl">
          <DialogHeader className="pb-4 border-b border-border/50">
            <DialogTitle>{editingLog ? "Edit Record" : "Log Service"}</DialogTitle>
            <DialogDescription>
              {editingLog ? "Update maintenance record details." : "Create a new maintenance record."}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="vehicleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-foreground/80"><Box className="w-3.5 h-3.5 text-primary" /> Vehicle</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                        disabled={isPending || isLoadingVehicles}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-muted/40 border-border/60 focus:ring-primary/50">
                            <SelectValue placeholder={isLoadingVehicles ? "Loading..." : "Select vehicle"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="z-[60] max-h-60">
                          {vehicles.map((v) => (
                            <SelectItem key={v.id} value={v.id}>
                              {v.name} ({v.licensePlate})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-foreground/80"><FileText className="w-3.5 h-3.5 text-primary" /> Description</FormLabel>
                      <FormControl>
                        <Textarea className="bg-muted/40 border-border/60 focus-visible:ring-primary/50 resize-none h-20" placeholder="e.g. Oil change and tire rotation... " disabled={isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5 text-foreground/80"><Calendar className="w-3.5 h-3.5 text-primary" /> Date</FormLabel>
                        <FormControl>
                          <Input className="bg-muted/40 border-border/60 focus-visible:ring-primary/50" type="date" disabled={isPending} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5 text-foreground/80"><IndianRupee className="w-3.5 h-3.5 text-primary" /> Cost (₹)</FormLabel>
                        <FormControl>
                          <Input className="bg-muted/40 border-border/60 focus-visible:ring-primary/50" type="number" step="0.01" min="0" placeholder="0.00" disabled={isPending} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="serviceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5 text-foreground/80"><Settings className="w-3.5 h-3.5 text-primary" /> Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                          disabled={isPending}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-muted/40 border-border/60 focus:ring-primary/50">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="z-[60]">
                            <SelectItem value="preventative">Preventative</SelectItem>
                            <SelectItem value="repair">Repair</SelectItem>
                            <SelectItem value="inspection">Inspection</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5 text-foreground/80"><Wrench className="w-3.5 h-3.5 text-primary" /> Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                          disabled={isPending}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-muted/40 border-border/60 focus:ring-primary/50">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="z-[60]">
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full mt-2" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingLog ? "Save Changes" : "Log Service"}
                </Button>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete maintenance log?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This removes the service record permanently from the vehicle's history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingLogId && deleteMutation.mutate(deletingLogId)}
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
