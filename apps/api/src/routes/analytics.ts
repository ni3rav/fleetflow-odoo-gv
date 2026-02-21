import { Router } from "express";
import type { Request, Response, NextFunction } from "express";

import { requireAuth, requireRole } from "@/lib/middleware";
import { AppError } from "@/lib/errors";
import * as analyticsService from "@/service/analytics";

const router = Router();

// GET /api/analytics/summary (manager, analyst — financial reports)
router.get(
  "/summary",
  requireAuth,
  requireRole("manager", "analyst"),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const summary = await analyticsService.getAnalyticsSummary();
      res.json(summary);
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
