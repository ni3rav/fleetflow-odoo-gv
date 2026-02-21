
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle } from "lucide-react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type Vehicle = {
  id: string;
  licensePlate: string;
  name: string;
  model: string;
  type: string;
  maxCapacityKg: number;
  odometer: number;
  status: string;
};

type Driver = {
  id: string;
  name: string;
  licenseNumber: string;
  licenseExpiry: string;
  status: string;
};

const formSchema = z.object({
  originAddress: z.string().min(2, "Origin must be at least 2 characters."),
  destination: z.string().min(2, "Destination must be at least 2 characters."),
  cargoWeightKg: z.coerce.number().min(0, "Must be a valid positive number"),
  vehicleId: z.string().min(1, "Please select a vehicle."),
  driverId: z.string().min(1, "Please select a driver."),
  startOdometer: z.coerce.number().min(0, "Odometer cannot be negative"),
  estimatedFuelCost: z.string().optional(),
  notes: z.string().optional(),
});


type FormValues = z.infer<typeof formSchema>;

export function TripCreationForm({ onSuccess }: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  const { data: availableVehicles = [], isLoading: isLoadingVehicles } = useQuery({
    queryKey: ["vehicles", "available"],
    queryFn: () => api.get<Vehicle[]>("/api/vehicles/available"),
  });

  const { data: availableDrivers = [], isLoading: isLoadingDrivers } = useQuery({
    queryKey: ["drivers", "available"],
    queryFn: () => api.get<Driver[]>("/api/drivers/available"),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      originAddress: "",
      destination: "",
      cargoWeightKg: 0,
      vehicleId: "",
      driverId: "",
      startOdometer: 0,
      estimatedFuelCost: "",
      notes: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: FormValues) => api.post("/api/trips", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      toast.success("Trip dispatched successfully!");
      form.reset();
      onSuccess?.();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error ?? (err.message || "Failed to create trip"));
    }
  });

  const watchVehicleId = form.watch("vehicleId");

  function onSubmit(values: FormValues) {
    // Client-side superRefine validation
    if (values.vehicleId && values.cargoWeightKg > 0) {
      const selectedVehicle = availableVehicles.find((v) => v.id === values.vehicleId);
      if (selectedVehicle && values.cargoWeightKg > selectedVehicle.maxCapacityKg) {
        form.setError("cargoWeightKg", {
          type: "manual",
          message: `Cargo weight exceeds vehicle capacity (${selectedVehicle.maxCapacityKg}kg).`
        });
        return;
      }
    }

    if (values.driverId) {
      const selectedDriver = availableDrivers.find((d) => d.id === values.driverId);
      if (selectedDriver) {
        const expiryDate = new Date(selectedDriver.licenseExpiry);
        if (expiryDate < new Date()) {
          form.setError("driverId", {
            type: "manual",
            message: `Cannot assign driver. License is expired.`
          });
          return;
        }
      }
    }

    createMutation.mutate(values);
  }

  const isPending = createMutation.isPending;

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="originAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Origin Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Warehouse A, New York" disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="destination"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Logistics Way, City" disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cargoWeightKg"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo Weight (kg)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Enter weight in kg" disabled={isPending} {...field} />
                  </FormControl>
                  <FormDescription>Must not exceed vehicle capacity.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startOdometer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Odometer (km)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Enter vehicle's starting odometer" disabled={isPending} {...field} />
                  </FormControl>
                  <FormDescription>
                    {watchVehicleId
                      ? `Suggested: ${availableVehicles.find(v => v.id === watchVehicleId)?.odometer || 0} km`
                      : "Select vehicle to see current odometer."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vehicleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign Vehicle</FormLabel>
                  <Select onValueChange={(val) => {
                    field.onChange(val);
                    // Auto format startOdometer if vehicle found
                    const v = availableVehicles.find(v => v.id === val);
                    if (v) form.setValue("startOdometer", v.odometer);
                  }} defaultValue={field.value} value={field.value} disabled={isPending || isLoadingVehicles}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingVehicles ? "Loading..." : "Select an available vehicle"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableVehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.name} ({vehicle.licensePlate}) - Max: {vehicle.maxCapacityKg}kg
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
              name="driverId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign Driver</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={isPending || isLoadingDrivers}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingDrivers ? "Loading..." : "Select an available driver"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableDrivers.map((driver) => {
                        const isExpired = new Date(driver.licenseExpiry) < new Date();
                        return (
                          <SelectItem key={driver.id} value={driver.id} disabled={isExpired}>
                            {driver.name} ({driver.licenseNumber})
                            {isExpired && " ⚠️ Expired"}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estimatedFuelCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Fuel Cost (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="Optional" disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Dispatch Notes (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Any special instructions for the driver..." disabled={isPending} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.formState.errors.root && (
            <div className="flex items-center gap-2 text-destructive text-sm mt-4 p-3 bg-destructive/10 rounded-md border border-destructive/20 md:col-span-2">
              <AlertCircle className="h-4 w-4" />
              <p>{form.formState.errors.root.message}</p>
            </div>
          )}

          <Button type="submit" className="w-full sm:w-auto" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Dispatch Trip
          </Button>
        </form>
      </Form>
    </div>
  );
}
