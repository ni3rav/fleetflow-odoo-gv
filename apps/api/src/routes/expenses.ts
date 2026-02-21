import { Router } from "express";
import type { Request, Response, NextFunction } from "express";

import { requireAuth, requireRole } from "@/lib/middleware";
import { AppError } from "@/lib/errors";
import {
  createExpenseSchema,
  updateExpenseSchema,
} from "@/validations/expense";
import * as expenseService from "@/service/expense";

const router = Router();

// GET /api/expenses
router.get(
  "/",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { vehicleId, tripId } = req.query;
      const list = await expenseService.listExpenses({
        vehicleId: vehicleId as string | undefined,
        tripId: tripId as string | undefined,
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

// GET /api/expenses/:id
router.get(
  "/:id",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const found = await expenseService.getExpenseById(req.params.id as string);
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

// POST /api/expenses (manager, dispatcher, financial analyst)
router.post(
  "/",
  requireAuth,
  requireRole("manager", "dispatcher", "safety_officer", "analyst"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createExpenseSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        });
        return;
      }
      const created = await expenseService.createExpense(parsed.data);
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

// PUT /api/expenses/:id
router.put(
  "/:id",
  requireAuth,
  requireRole("manager", "dispatcher", "analyst"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = updateExpenseSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        });
        return;
      }
      const updated = await expenseService.updateExpense(
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

// DELETE /api/expenses/:id (manager, analyst)
router.delete(
  "/:id",
  requireAuth,
  requireRole("manager", "analyst"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await expenseService.deleteExpense(req.params.id as string);
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
