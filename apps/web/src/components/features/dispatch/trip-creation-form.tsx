import { useState } from "react";
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
import { AlertCircle, CheckCircle2 } from "lucide-react";

const MOCK_VEHICLES = [
  { id: "V-101", name: "Ford Transit", capacity: 1500, status: "Available" },
  { id: "V-102", name: "Mercedes Sprinter", capacity: 2000, status: "On Trip" },
  { id: "V-103", name: "Renault Master", capacity: 1800, status: "In Shop" },
  { id: "V-104", name: "VW Crafter", capacity: 2200, status: "Available" },
];

const MOCK_DRIVERS = [
  { id: "D-001", name: "John Doe", status: "Available", licenseStatus: "Valid" },
  { id: "D-002", name: "Jane Smith", status: "Available", licenseStatus: "Expired" },
  { id: "D-003", name: "Mike Johnson", status: "On Trip", licenseStatus: "Valid" },
];

const formSchema = z.object({
  destination: z.string().min(2, "Destination must be at least 2 characters."),
  cargoWeight: z.string().regex(/^\d+$/, "Must be a valid positive number"),
  vehicleId: z.string().min(1, "Please select a vehicle."),
  driverId: z.string().min(1, "Please select a driver."),
  notes: z.string().optional(),
}).superRefine((data, ctx) => {
  const weight = Number(data.cargoWeight);

  if (data.vehicleId && weight > 0) {
    const selectedVehicle = MOCK_VEHICLES.find((v) => v.id === data.vehicleId);
    if (selectedVehicle && weight > selectedVehicle.capacity) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["cargoWeight"],
        message: `Cargo weight (${weight}kg) exceeds vehicle capacity (${selectedVehicle.capacity}kg).`,
      });
    }
  }

  if (data.driverId) {
    const selectedDriver = MOCK_DRIVERS.find((d) => d.id === data.driverId);
    if (selectedDriver && selectedDriver.licenseStatus === "Expired") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["driverId"],
        message: `Cannot assign driver. License is expired.`,
      });
    }
  }
});

type FormValues = z.infer<typeof formSchema>;

export function TripCreationForm() {
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      destination: "",
      cargoWeight: "0",
      vehicleId: "",
      driverId: "",
      notes: "",
    },
  });

  const availableVehicles = MOCK_VEHICLES.filter(v => v.status === "Available");
  const availableDrivers = MOCK_DRIVERS.filter(d => d.status === "Available");

  function onSubmit(values: FormValues) {
    console.log("Trip Dispatched Successfully:", values);
    setIsSuccess(true);
    setTimeout(() => {
      form.reset();
      setIsSuccess(false);
    }, 3000);
  }

  return (
    <div className="w-full">
      {isSuccess ? (
        <div className="flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300">
          <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-4" />
          <h3 className="text-xl font-medium text-foreground">Trip Successfully Dispatched!</h3>
          <p className="text-muted-foreground mt-2">The driver has been notified and the vehicle status is now 'On Trip'.</p>
          <Button variant="outline" className="mt-6" onClick={() => setIsSuccess(false)}>
            Dispatch Another Trip
          </Button>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Logistics Way, City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cargoWeight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo Weight (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter weight in kg" {...field} />
                    </FormControl>
                    <FormDescription>Must not exceed vehicle capacity.</FormDescription>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an available vehicle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableVehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.name} ({vehicle.id}) - Max: {vehicle.capacity}kg
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
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an available driver" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableDrivers.map((driver) => (
                          <SelectItem key={driver.id} value={driver.id}>
                            {driver.name} ({driver.id})
                            {driver.licenseStatus === "Expired" && " ⚠️ Expired"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dispatch Notes (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Any special instructions for the driver..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.formState.errors.root && (
              <div className="flex items-center gap-2 text-destructive text-sm mt-4 p-3 bg-destructive/10 rounded-md border border-destructive/20">
                <AlertCircle className="h-4 w-4" />
                <p>{form.formState.errors.root.message}</p>
              </div>
            )}

            <Button type="submit" className="w-full sm:w-auto" disabled={form.formState.isSubmitting}>
              Dispatch Trip
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
}
