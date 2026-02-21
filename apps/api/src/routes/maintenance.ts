import { Router } from "express";
import type { Request, Response, NextFunction } from "express";

import { requireAuth, requireRole } from "@/lib/middleware";
import { AppError } from "@/lib/errors";
import {
  createMaintenanceSchema,
  updateMaintenanceSchema,
} from "@/validations/maintenance";
import * as maintenanceService from "@/service/maintenance";

const router = Router();

// GET /api/maintenance
router.get(
  "/",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { vehicleId } = req.query;
      const list = await maintenanceService.listMaintenance({
        vehicleId: vehicleId as string | undefined,
      });
      res.json(list);
    } catch (err) {
      if (err instanceof AppError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
      }
      next(err);
    }
  },
);

// GET /api/maintenance/:id
router.get(
  "/:id",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const found = await maintenanceService.getMaintenanceById(
        req.params.id as string,
      );
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

// POST /api/maintenance (manager)
router.post(
  "/",
  requireAuth,
  requireRole("manager"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createMaintenanceSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        });
        return;
      }
      const created = await maintenanceService.createMaintenance(parsed.data);
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

// PUT /api/maintenance/:id (manager)
router.put(
  "/:id",
  requireAuth,
  requireRole("manager"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = updateMaintenanceSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        });
        return;
      }
      const updated = await maintenanceService.updateMaintenance(
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
