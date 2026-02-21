import { Router } from "express";
import type { Request, Response, NextFunction } from "express";

import { requireAuth } from "@/lib/middleware";
import { AppError } from "@/lib/errors";
import * as dashboardService from "@/service/dashboard";

const router = Router();

// GET /api/dashboard/kpis
router.get(
  "/kpis",
  requireAuth,
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const kpis = await dashboardService.getKpis();
      res.json(kpis);
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
