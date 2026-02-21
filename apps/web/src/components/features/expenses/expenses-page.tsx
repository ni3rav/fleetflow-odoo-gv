import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { CircleDollarSign, Plus, Edit, Trash2, Loader2, Calendar, FileText, Settings, IndianRupee, Box } from "lucide-react";

import { api } from "@/lib/api-client";
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
};

type Expense = {
  id: string;
  vehicle: Vehicle;
  tripId?: string;
  amount: string;
  category: "fuel" | "maintenance" | "toll" | "other";
  date: string;
  description: string;
  createdAt: string;
};

const formSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  category: z.enum(["fuel", "maintenance", "toll", "other"], { message: "Select a category" }),
  date: z.string().min(1, "Date is required"),
  description: z.string().min(2, "Description is required"),
  tripId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function ExpensesPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ["expenses"],
    queryFn: () => api.get<Expense[]>("/api/expenses"),
  });

  const { data: vehicles = [], isLoading: isLoadingVehicles } = useQuery({
    queryKey: ["vehicles"],
    queryFn: () => api.get<Vehicle[]>("/api/vehicles"),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      vehicleId: "",
      amount: 0,
      category: "fuel",
      date: new Date().toISOString().split("T")[0],
      description: "",
      tripId: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: FormValues) => api.post("/api/expenses", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense logged successfully!");
      setIsDialogOpen(false);
    },
    onError: (err: any) => toast.error(err.response?.data?.error || "Failed to log expense"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; values: FormValues }) =>
      api.put(`/api/expenses/${data.id}`, data.values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense updated successfully!");
      setIsDialogOpen(false);
    },
    onError: (err: any) => toast.error(err.response?.data?.error || "Failed to update expense"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/expenses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense deleted permanently!");
      setIsDeleteDialogOpen(false);
    },
    onError: (err: any) => toast.error(err.response?.data?.error || "Failed to delete expense"),
  });

  const onSubmit = (values: FormValues) => {
    if (editingExpense) {
      updateMutation.mutate({ id: editingExpense.id, values });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleOpenAdd = () => {
    setEditingExpense(null);
    form.reset({
      vehicleId: "",
      amount: 0,
      category: "fuel",
      date: new Date().toISOString().split("T")[0],
      description: "",
      tripId: "",
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (expense: Expense) => {
    setEditingExpense(expense);
    form.reset({
      vehicleId: expense.vehicle?.id || "",
      amount: Number(expense.amount),
      category: expense.category,
      date: new Date(expense.date).toISOString().split("T")[0],
      description: expense.description,
      tripId: expense.tripId || "",
    });
    setIsDialogOpen(true);
  };

  const handleOpenDelete = (id: string) => {
    setDeletingExpenseId(id);
    setIsDeleteDialogOpen(true);
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "fuel":
        return "bg-amber-500/15 text-amber-600 border-amber-500/20";
      case "maintenance":
        return "bg-rose-500/15 text-rose-600 border-rose-500/20";
      case "toll":
        return "bg-blue-500/15 text-blue-600 border-blue-500/20";
      default:
        return "bg-slate-500/15 text-slate-400 border-slate-500/20";
    }
  };

  const formatText = (text: string) => {
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Expenses & Fuel</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Log financial tracking per asset including fuel and maintenance costs.
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Log Expense
        </Button>
      </div>

      <Card className="border-border/50 bg-card shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/10 border-b border-border/50 pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <CircleDollarSign className="h-5 w-5 text-primary" />
            Expense Tracker
          </CardTitle>
          <CardDescription>Monitor and log all financial outgoings related to fleet operation.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto flex-shrink-0" /></TableCell>
                  </TableRow>
                ))
              ) : expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <CircleDollarSign className="h-8 w-8 text-muted-foreground/50" />
                      <p>No expenses logged yet.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((expense) => (
                  <TableRow key={expense.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="whitespace-nowrap">
                      {new Date(expense.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{expense.vehicle?.name || "Unknown"}</div>
                      <div className="text-xs text-muted-foreground">{expense.vehicle?.licensePlate}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getCategoryBadge(expense.category)}>
                        {formatText(expense.category)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="truncate max-w-[250px]" title={expense.description}>
                        {expense.description}
                      </div>
                      {expense.tripId && (
                        <div className="text-xs text-muted-foreground mt-0.5 max-w-[200px] truncate" title={expense.tripId}>
                          Trip: {expense.tripId}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-destructive">
                      ₹{Number(expense.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                          onClick={() => handleOpenEdit(expense)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleOpenDelete(expense.id)}
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

      {/* Add / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[425px] rounded-2xl">
          <DialogHeader className="pb-4 border-b border-border/50">
            <DialogTitle>{editingExpense ? "Edit Expense" : "Log Expense"}</DialogTitle>
            <DialogDescription>
              {editingExpense ? "Update expense details." : "Record a new fleet expense."}
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

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5 text-foreground/80"><IndianRupee className="w-3.5 h-3.5 text-primary" /> Amount (₹)</FormLabel>
                        <FormControl>
                          <Input className="bg-muted/40 border-border/60 focus-visible:ring-primary/50" type="number" step="0.01" min="0" placeholder="0.00" disabled={isPending} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5 text-foreground/80"><Settings className="w-3.5 h-3.5 text-primary" /> Category</FormLabel>
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
                            <SelectItem value="fuel">Fuel</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="toll">Toll</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tripId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5 text-foreground/80">Trip ID (Optional)</FormLabel>
                        <FormControl>
                          <Input className="bg-muted/40 border-border/60 focus-visible:ring-primary/50" placeholder="Optional" disabled={isPending} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5 text-foreground/80"><FileText className="w-3.5 h-3.5 text-primary" /> Description</FormLabel>
                      <FormControl>
                        <Textarea className="bg-muted/40 border-border/60 focus-visible:ring-primary/50 resize-none h-20" placeholder="e.g. Refueled at Station X..." disabled={isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full mt-2" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingExpense ? "Save Changes" : "Log Expense"}
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
            <AlertDialogTitle>Delete Expense?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The expense record will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingExpenseId && deleteMutation.mutate(deletingExpenseId)}
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
