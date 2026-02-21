import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Users, Plus, Edit, Trash2, Loader2, AlertCircle, IdCard, Calendar, ShieldCheck } from "lucide-react";

import { api } from "@/lib/api-client";
import { useHasRole } from "@/hooks/use-role";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

type Driver = {
  id: string;
  name: string;
  licenseNumber: string;
  licenseExpiry: string;
  safetyScore: number;
  completionRate: number;
  complaints: number;
  status: "on_duty" | "off_duty" | "suspended";
  createdAt: string;
  updatedAt: string;
};

const driverSchema = z.object({
  name: z.string().min(1, "Name is required"),
  licenseNumber: z.string().min(1, "License number is required"),
  licenseExpiry: z.string().min(1, "License expiry date is required"),
  safetyScore: z.coerce.number().min(0).max(100).default(100),
});

type DriverFormValues = z.infer<typeof driverSchema>;

function formatDutyLabel(status: string): string {
  const labels: Record<string, string> = {
    on_duty: "On Duty",
    off_duty: "Off Duty",
    suspended: "Suspended",
  };
  return labels[status] ?? status;
}

function getStatusChangeErrorMessage(err: unknown): string {
  const msg =
    (err as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.error ??
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
    (err instanceof Error ? err.message : "");
  if (msg.includes("Requires one of") || msg.includes("Forbidden")) return "You don't have permission to change driver status.";
  if (msg.includes("active trip")) return "This driver has active trip(s). Complete or cancel them before changing status.";
  if (msg.includes("Driver not found")) return "Driver not found.";
  return msg || "Couldn't update driver status. Try again.";
}

export function DriversPage() {
  const queryClient = useQueryClient();
  const canCreateEditDriver = useHasRole(["manager", "safety_officer"]);
  const canDeleteDriver = useHasRole(["manager"]);
  const canChangeDriverStatus = useHasRole(["manager", "dispatcher", "safety_officer"]); // PATCH status
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingDriverId, setDeletingDriverId] = useState<string | null>(null);

  const { data: drivers = [], isLoading } = useQuery({
    queryKey: ["drivers"],
    queryFn: () => api.get<Driver[]>("/api/drivers"),
  });

  const form = useForm<DriverFormValues>({
    resolver: zodResolver(driverSchema) as Resolver<DriverFormValues>,
    defaultValues: {
      name: "",
      licenseNumber: "",
      licenseExpiry: "",
      safetyScore: 100,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: DriverFormValues) => api.post("/api/drivers", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      toast.success("Driver added successfully!");
      setIsDialogOpen(false);
    },
    onError: (err: Error) => toast.error(err.message || "Failed to add driver"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; values: DriverFormValues }) =>
      api.put(`/api/drivers/${data.id}`, data.values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      toast.success("Driver updated successfully!");
      setIsDialogOpen(false);
    },
    onError: (err: Error) => toast.error(err.message || "Failed to update driver"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/drivers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      toast.success("Driver deleted successfully!");
      setIsDeleteDialogOpen(false);
    },
    onError: (err: Error) => toast.error(err.message || "Failed to delete driver"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/api/drivers/${id}/status`, { status }),
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      toast.success(`Driver set to ${formatDutyLabel(status)}.`);
    },
    onError: (err) => toast.error(getStatusChangeErrorMessage(err)),
  });

  const onSubmit = (values: DriverFormValues) => {
    if (editingDriver) {
      updateMutation.mutate({ id: editingDriver.id, values });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleOpenAdd = () => {
    setEditingDriver(null);
    form.reset({
      name: "",
      licenseNumber: "",
      licenseExpiry: "",
      safetyScore: 100,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (driver: Driver) => {
    setEditingDriver(driver);
    form.reset({
      name: driver.name,
      licenseNumber: driver.licenseNumber,
      // Input type="date" expects YYYY-MM-DD
      licenseExpiry: driver.licenseExpiry.substring(0, 10),
      safetyScore: driver.safetyScore,
    });
    setIsDialogOpen(true);
  };

  const handleOpenDelete = (id: string) => {
    setDeletingDriverId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleStatusChange = (id: string, status: string) => {
    statusMutation.mutate({ id, status });
  };

  // License expiry logic
  const renderExpiryBadge = (expiryStr: string) => {
    if (!expiryStr) return null;
    const expiryDate = new Date(expiryStr);
    const today = new Date();

    // reset times for fair day comparison
    expiryDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(expiryDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (expiryDate < today) {
      return <Badge className="bg-destructive/15 text-destructive hover:bg-destructive/25 border-destructive/20 ml-2" variant="outline">Expired</Badge>;
    } else if (diffDays <= 30) {
      return <Badge className="bg-amber-500/15 text-amber-600 hover:bg-amber-500/25 border-amber-500/20 ml-2" variant="outline">Expiring Soon</Badge>;
    }
    return null;
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Driver Profiles</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage personnel, track compliance, and view safety scores.
          </p>
        </div>
        {canCreateEditDriver && (
          <Button onClick={handleOpenAdd} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" /> Add Driver
          </Button>
        )}
      </div>

      <Card className="border-border/50 bg-card shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/10 border-b border-border/50 pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Personnel Registry
          </CardTitle>
          <CardDescription>Directory of all assigned drivers and their current status.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Driver Name</TableHead>
                <TableHead>License Info</TableHead>
                <TableHead>Safety Score</TableHead>
                <TableHead>Complaints</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-28 rounded-md" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto shrink-0" /></TableCell>
                  </TableRow>
                ))
              ) : drivers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
                      <p>No drivers yet. Add your first driver.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                drivers.map((d) => (
                  <TableRow key={d.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{d.licenseNumber}</span>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          Expires: {new Date(d.licenseExpiry).toLocaleDateString()}
                          {renderExpiryBadge(d.licenseExpiry)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        d.safetyScore >= 90 ? "bg-emerald-500/10 text-emerald-600 border-none" :
                          d.safetyScore >= 70 ? "bg-amber-500/10 text-amber-600 border-none" :
                            "bg-destructive/10 text-destructive border-none"
                      }>
                        {d.safetyScore}/100
                      </Badge>
                    </TableCell>
                    <TableCell>{d.complaints || 0}</TableCell>
                    <TableCell>
                      {canChangeDriverStatus ? (
                        <Select
                          value={d.status}
                          onValueChange={(status) => handleStatusChange(d.id, status)}
                          disabled={statusMutation.isPending && statusMutation.variables?.id === d.id}
                        >
                          <SelectTrigger className="w-[130px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="on_duty">On Duty</SelectItem>
                            <SelectItem value="off_duty">Off Duty</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="outline" className="font-normal">
                          {formatDutyLabel(d.status)}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {canCreateEditDriver && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                            onClick={() => handleOpenEdit(d)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {canDeleteDriver && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleOpenDelete(d.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        {!canCreateEditDriver && !canDeleteDriver && (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </div>
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
            <DialogTitle>{editingDriver ? "Edit Driver" : "Add Driver"}</DialogTitle>
            <DialogDescription>
              {editingDriver ? "Update driver details and compliance." : "Register a new qualified driver."}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-foreground/80"><Users className="w-3.5 h-3.5 text-primary" /> Full Name</FormLabel>
                      <FormControl>
                        <Input className="bg-muted/40 border-border/60 focus-visible:ring-primary/50" placeholder="e.g. John Doe" disabled={isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="licenseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-foreground/80"><IdCard className="w-3.5 h-3.5 text-primary" /> License Number</FormLabel>
                      <FormControl>
                        <Input className="bg-muted/40 border-border/60 focus-visible:ring-primary/50" placeholder="e.g. D1234567" disabled={isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="licenseExpiry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-foreground/80"><Calendar className="w-3.5 h-3.5 text-primary" /> License Expiry Date</FormLabel>
                      <FormControl>
                        <Input className="bg-muted/40 border-border/60 focus-visible:ring-primary/50" type="date" disabled={isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="safetyScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-foreground/80"><ShieldCheck className="w-3.5 h-3.5 text-primary" /> Initial Safety Score (0-100)</FormLabel>
                      <FormControl>
                        <Input className="bg-muted/40 border-border/60 focus-visible:ring-primary/50" type="number" min="0" max="100" disabled={isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full mt-2" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingDriver ? "Save Changes" : "Register Driver"}
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
            <AlertDialogTitle>Are you sure you want to delete this driver?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This removes the driver's profile, compliance records, and logs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingDriverId && deleteMutation.mutate(deletingDriverId)}
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
