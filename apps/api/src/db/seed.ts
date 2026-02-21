import "dotenv/config";

import { db } from "@/db/client";
import { vehicle } from "@/db/schema/vehicle";
import { driver } from "@/db/schema/driver";
import { trip } from "@/db/schema/trip";
import { maintenanceLog } from "@/db/schema/maintenance";
import { expense } from "@/db/schema/expense";

function uuid() {
  return crypto.randomUUID();
}

function date(daysOffset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().slice(0, 10);
}

async function seed() {
  console.log("Seeding database...");

  // 1. Vehicles
  const vehicleIds = {
    van1: uuid(),
    van2: uuid(),
    truck1: uuid(),
    bike1: uuid(),
  };

  await db.insert(vehicle).values([
    {
      id: vehicleIds.van1,
      licensePlate: "MH-01-AB-1234",
      name: "Van-01",
      model: "Ford Transit",
      type: "van",
      maxCapacityKg: 500,
      odometer: 45200,
      status: "available",
    },
    {
      id: vehicleIds.van2,
      licensePlate: "MH-02-CD-5678",
      name: "Van-02",
      model: "Mercedes Sprinter",
      type: "van",
      maxCapacityKg: 750,
      odometer: 32100,
      status: "available",
    },
    {
      id: vehicleIds.truck1,
      licensePlate: "MH-03-EF-9012",
      name: "Truck-01",
      model: "Tata Ace",
      type: "truck",
      maxCapacityKg: 1500,
      odometer: 67800,
      status: "available",
    },
    {
      id: vehicleIds.bike1,
      licensePlate: "MH-12-GH-3456",
      name: "Bike-01",
      model: "Bajaj Boxer",
      type: "bike",
      maxCapacityKg: 50,
      odometer: 12000,
      status: "available",
    },
  ]);
  console.log("  ✓ Vehicles (4)");

  // 2. Drivers
  const driverIds = {
    alex: uuid(),
    sam: uuid(),
    jordan: uuid(),
  };

  await db.insert(driver).values([
    {
      id: driverIds.alex,
      name: "Alex",
      licenseNumber: "DL-1234567",
      licenseExpiry: date(90), // valid
      safetyScore: 95,
      completionRate: 98,
      complaints: 0,
      status: "on_duty",
    },
    {
      id: driverIds.sam,
      name: "Sam",
      licenseNumber: "DL-7654321",
      licenseExpiry: date(45),
      safetyScore: 88,
      completionRate: 92,
      complaints: 1,
      status: "off_duty",
    },
    {
      id: driverIds.jordan,
      name: "Jordan",
      licenseNumber: "DL-1122334",
      licenseExpiry: date(200),
      safetyScore: 100,
      completionRate: 100,
      complaints: 0,
      status: "on_duty",
    },
  ]);
  console.log("  ✓ Drivers (3)");

  // 3. Trips (draft + one completed for analytics)
  const tripIds = {
    draft1: uuid(),
    completed1: uuid(),
  };

  await db.insert(trip).values([
    {
      id: tripIds.draft1,
      vehicleId: vehicleIds.van1,
      driverId: driverIds.alex,
      cargoWeightKg: 450,
      originAddress: "Warehouse A, Mumbai",
      destination: "Client Site, Pune",
      startOdometer: 45200,
      estimatedFuelCost: "2500",
      status: "draft",
    },
    {
      id: tripIds.completed1,
      vehicleId: vehicleIds.van2,
      driverId: driverIds.jordan,
      cargoWeightKg: 600,
      originAddress: "Hub Delhi",
      destination: "Customer Gurgaon",
      startOdometer: 32100,
      endOdometer: 32180,
      estimatedFuelCost: "1800",
      actualFuelCost: "1750",
      status: "completed",
    },
  ]);
  console.log("  ✓ Trips (2)");

  // 4. Maintenance logs
  await db.insert(maintenanceLog).values([
    {
      id: uuid(),
      vehicleId: vehicleIds.truck1,
      serviceType: "preventative",
      description: "Oil change and filter replacement",
      cost: "3500",
      date: date(-7),
      status: "completed",
    },
    {
      id: uuid(),
      vehicleId: vehicleIds.bike1,
      serviceType: "inspection",
      description: "Brake pad check",
      cost: "800",
      date: date(-2),
      status: "in_progress",
    },
  ]);
  console.log("  ✓ Maintenance logs (2)");

  // 5. Expenses (fuel + misc)
  await db.insert(expense).values([
    {
      id: uuid(),
      vehicleId: vehicleIds.van2,
      tripId: tripIds.completed1,
      fuelLiters: "45.5",
      fuelCost: "4200",
      miscExpense: null,
      miscDescription: null,
      date: date(-1),
    },
    {
      id: uuid(),
      vehicleId: vehicleIds.van1,
      tripId: null,
      fuelLiters: null,
      fuelCost: null,
      miscExpense: "500",
      miscDescription: "Toll charges",
      date: date(-3),
    },
  ]);
  console.log("  ✓ Expenses (2)");

  console.log("Done. Users are created via app signup (not seeded).");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
