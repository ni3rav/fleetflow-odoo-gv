import { Router } from "express";
import type { Request, Response, NextFunction } from "express";

import { requireAuth, requireRole } from "@/lib/middleware";
import { AppError } from "@/lib/errors";
import {
  createTripSchema,
  updateTripStatusSchema,
} from "@/validations/trip";
import * as tripService from "@/service/trip";

const router = Router();

// GET /api/trips
router.get(
  "/",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, vehicleId, driverId } = req.query;
      const trips = await tripService.listTrips({
        status: status as string | undefined,
        vehicleId: vehicleId as string | undefined,
        driverId: driverId as string | undefined,
      });
      res.json(trips);
    } catch (err) {
      if (err instanceof AppError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
      }
      next(err);
    }
  },
);

// GET /api/trips/:id
router.get(
  "/:id",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const found = await tripService.getTripById(req.params.id as string);
      res.json(found);
    } catch (err) {
      if (err instanceof AppError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
      }
      next(err);
    }
  },
);

// POST /api/trips (manager, dispatcher)
router.post(
  "/",
  requireAuth,
  requireRole("manager", "dispatcher"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createTripSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        });
        return;
      }
      const created = await tripService.createTrip(parsed.data);
      res.status(201).json(created);
    } catch (err) {
      if (err instanceof AppError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
      }
      next(err);
    }
  },
);

// PATCH /api/trips/:id/status (manager, dispatcher)
router.patch(
  "/:id/status",
  requireAuth,
  requireRole("manager", "dispatcher"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = updateTripStatusSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        });
        return;
      }
      const updated = await tripService.updateTripStatus(
        req.params.id as string,
        parsed.data,
      );
      res.json(updated);
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
