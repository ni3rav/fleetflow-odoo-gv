import { Router } from "express";
import type { Request, Response, NextFunction } from "express";

import { requireAuth, requireRole } from "@/lib/middleware";
import { AppError } from "@/lib/errors";
import {
  createVehicleSchema,
  updateVehicleSchema,
} from "@/validations/vehicle";
import * as vehicleService from "@/service/vehicle";

const router = Router();

// GET /api/vehicles
router.get(
  "/",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, type } = req.query;
      const vehicles = await vehicleService.listVehicles({
        status: status as string | undefined,
        type: type as string | undefined,
      });
      res.json(vehicles);
    } catch (err) {
      if (err instanceof AppError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
      }
      next(err);
    }
  },
);

// GET /api/vehicles/available
router.get(
  "/available",
  requireAuth,
  requireRole("manager", "dispatcher"),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const vehicles = await vehicleService.getAvailableVehicles();
      res.json(vehicles);
    } catch (err) {
      if (err instanceof AppError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
      }
      next(err);
    }
  },
);

// GET /api/vehicles/:id
router.get(
  "/:id",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const vehicle = await vehicleService.getVehicleById(
        req.params.id as string,
      );
      res.json(vehicle);
    } catch (err) {
      if (err instanceof AppError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
      }
      next(err);
    }
  },
);

// POST /api/vehicles (manager only)
router.post(
  "/",
  requireAuth,
  requireRole("manager"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createVehicleSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        });
        return;
      }
      const vehicle = await vehicleService.createVehicle(parsed.data);
      res.status(201).json(vehicle);
    } catch (err) {
      if (err instanceof AppError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
      }
      const errStr =
        err instanceof Error
          ? `${err.message} ${(err as unknown as { cause?: Error }).cause?.message ?? ""}`
          : String(err);
      if (errStr.includes("unique")) {
        res
          .status(409)
          .json({ error: "A vehicle with this license plate already exists" });
        return;
      }
      next(err);
    }
  },
);

// PUT /api/vehicles/:id (manager only)
router.put(
  "/:id",
  requireAuth,
  requireRole("manager"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = updateVehicleSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        });
        return;
      }
      const vehicle = await vehicleService.updateVehicle(
        req.params.id as string,
        parsed.data,
      );
      res.json(vehicle);
    } catch (err) {
      if (err instanceof AppError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
      }
      next(err);
    }
  },
);

// DELETE /api/vehicles/:id (manager only)
router.delete(
  "/:id",
  requireAuth,
  requireRole("manager"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await vehicleService.deleteVehicle(req.params.id as string);
      res.status(204).send();
    } catch (err) {
      if (err instanceof AppError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
      }
      next(err);
    }
  },
);

export default router;
