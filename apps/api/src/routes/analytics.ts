import { Router } from "express";
import type { Request, Response, NextFunction } from "express";

import { requireAuth } from "@/lib/middleware";
import { AppError } from "@/lib/errors";
import * as analyticsService from "@/service/analytics";

const router = Router();

// GET /api/analytics/summary
router.get(
  "/summary",
  requireAuth,
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
