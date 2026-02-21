import { Router } from "express";
import type { Request, Response, NextFunction } from "express";

import { requireAuth, requireRole } from "@/lib/middleware";
import { AppError } from "@/lib/errors";
import {
  createDriverSchema,
  updateDriverSchema,
  updateDriverStatusSchema,
} from "@/validations/driver";
import * as driverService from "@/service/driver";

const router = Router();

// GET /api/drivers
router.get(
  "/",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status } = req.query;
      const drivers = await driverService.listDrivers({
        status: status as string | undefined,
      });
      res.json(drivers);
    } catch (err) {
      if (err instanceof AppError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
      }
      next(err);
    }
  },
);

// GET /api/drivers/available
router.get(
  "/available",
  requireAuth,
  requireRole("manager", "dispatcher"),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const drivers = await driverService.getAvailableDrivers();
      res.json(drivers);
    } catch (err) {
      if (err instanceof AppError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
      }
      next(err);
    }
  },
);

// GET /api/drivers/:id
router.get(
  "/:id",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const found = await driverService.getDriverById(req.params.id as string);
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

// POST /api/drivers (manager, safety_officer)
router.post(
  "/",
  requireAuth,
  requireRole("manager", "safety_officer"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createDriverSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        });
        return;
      }
      const created = await driverService.createDriver(parsed.data);
      res.status(201).json(created);
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
          .json({ error: "A driver with this license number already exists" });
        return;
      }
      next(err);
    }
  },
);

// PUT /api/drivers/:id (manager, safety_officer)
router.put(
  "/:id",
  requireAuth,
  requireRole("manager", "safety_officer"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = updateDriverSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        });
        return;
      }
      const updated = await driverService.updateDriver(
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

// PATCH /api/drivers/:id/status (manager, safety_officer)
router.patch(
  "/:id/status",
  requireAuth,
  requireRole("manager", "safety_officer"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = updateDriverStatusSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        });
        return;
      }
      const updated = await driverService.updateDriverStatus(
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

// DELETE /api/drivers/:id (manager only)
router.delete(
  "/:id",
  requireAuth,
  requireRole("manager"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await driverService.deleteDriver(req.params.id as string);
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
