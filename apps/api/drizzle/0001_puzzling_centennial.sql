CREATE TYPE "public"."vehicle_status" AS ENUM('available', 'on_trip', 'in_shop', 'retired');--> statement-breakpoint
CREATE TYPE "public"."vehicle_type" AS ENUM('truck', 'van', 'bike');--> statement-breakpoint
CREATE TYPE "public"."driver_status" AS ENUM('on_duty', 'off_duty', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."trip_status" AS ENUM('draft', 'dispatched', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."maintenance_status" AS ENUM('in_progress', 'completed');--> statement-breakpoint
CREATE TABLE "vehicle" (
	"id" text PRIMARY KEY NOT NULL,
	"license_plate" text NOT NULL,
	"name" text NOT NULL,
	"model" text NOT NULL,
	"type" "vehicle_type" NOT NULL,
	"max_capacity_kg" integer NOT NULL,
	"odometer" integer DEFAULT 0 NOT NULL,
	"status" "vehicle_status" DEFAULT 'available' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vehicle_license_plate_unique" UNIQUE("license_plate")
);
--> statement-breakpoint
CREATE TABLE "driver" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"license_number" text NOT NULL,
	"license_expiry" date NOT NULL,
	"safety_score" integer DEFAULT 100 NOT NULL,
	"completion_rate" integer DEFAULT 0 NOT NULL,
	"complaints" integer DEFAULT 0 NOT NULL,
	"status" "driver_status" DEFAULT 'on_duty' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "driver_license_number_unique" UNIQUE("license_number")
);
--> statement-breakpoint
CREATE TABLE "trip" (
	"id" text PRIMARY KEY NOT NULL,
	"vehicle_id" text NOT NULL,
	"driver_id" text NOT NULL,
	"cargo_weight_kg" integer NOT NULL,
	"origin_address" text NOT NULL,
	"destination" text NOT NULL,
	"estimated_fuel_cost" numeric(10, 2),
	"actual_fuel_cost" numeric(10, 2),
	"start_odometer" integer NOT NULL,
	"end_odometer" integer,
	"status" "trip_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "maintenance_log" (
	"id" text PRIMARY KEY NOT NULL,
	"vehicle_id" text NOT NULL,
	"service_type" text NOT NULL,
	"description" text,
	"cost" numeric(10, 2) NOT NULL,
	"date" date NOT NULL,
	"status" "maintenance_status" DEFAULT 'in_progress' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expense" (
	"id" text PRIMARY KEY NOT NULL,
	"trip_id" text,
	"vehicle_id" text NOT NULL,
	"fuel_liters" numeric(10, 2),
	"fuel_cost" numeric(10, 2),
	"misc_expense" numeric(10, 2),
	"misc_description" text,
	"date" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "trip" ADD CONSTRAINT "trip_vehicle_id_vehicle_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicle"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip" ADD CONSTRAINT "trip_driver_id_driver_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."driver"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_log" ADD CONSTRAINT "maintenance_log_vehicle_id_vehicle_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicle"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense" ADD CONSTRAINT "expense_trip_id_trip_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trip"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense" ADD CONSTRAINT "expense_vehicle_id_vehicle_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicle"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "vehicle_status_idx" ON "vehicle" USING btree ("status");--> statement-breakpoint
CREATE INDEX "vehicle_type_idx" ON "vehicle" USING btree ("type");--> statement-breakpoint
CREATE INDEX "driver_status_idx" ON "driver" USING btree ("status");--> statement-breakpoint
CREATE INDEX "trip_vehicle_id_idx" ON "trip" USING btree ("vehicle_id");--> statement-breakpoint
CREATE INDEX "trip_driver_id_idx" ON "trip" USING btree ("driver_id");--> statement-breakpoint
CREATE INDEX "trip_status_idx" ON "trip" USING btree ("status");--> statement-breakpoint
CREATE INDEX "maintenance_vehicle_id_idx" ON "maintenance_log" USING btree ("vehicle_id");--> statement-breakpoint
CREATE INDEX "expense_trip_id_idx" ON "expense" USING btree ("trip_id");--> statement-breakpoint
CREATE INDEX "expense_vehicle_id_idx" ON "expense" USING btree ("vehicle_id");