import type { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";

import { auth } from "@/lib/auth";
import logger from "@/lib/logger";

export type FleetRole = "manager" | "dispatcher" | "safety_officer" | "analyst";

/**
 * RBAC reference (PS-aligned):
 * - Vehicles: list/get = all auth; available = manager, dispatcher; create/update/delete = manager
 * - Drivers: list/get = all auth; available = manager, dispatcher; create/update = manager, safety_officer; status = manager, dispatcher, safety_officer; delete = manager
 * - Trips: list/get = all auth; create/status = manager, dispatcher
 * - Maintenance: list/get = all auth; create/update = manager
 * - Expenses: list/get = all auth; create = manager, dispatcher, analyst; update = manager, dispatcher, analyst; delete = manager
 * - Dashboard KPIs: all auth
 * - Analytics summary: manager, analyst
 */

/**
 * Middleware that requires a valid session.
 * Attaches `req.user` and `req.session` on success.
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      res
        .status(401)
        .json({ error: "Unauthorized", message: "No active session" });
      return;
    }

    req.user = session.user;
    req.session = session.session;
    next();
  } catch (error) {
    logger.error({ error }, "Auth middleware error");
    res
      .status(401)
      .json({ error: "Unauthorized", message: "Invalid or expired session" });
  }
}

/**
 * Middleware factory that restricts access to specific roles.
 * Must be used AFTER `requireAuth`.
 *
 * @example
 * router.delete("/:id", requireAuth, requireRole("manager"), handler);
 * router.get("/", requireAuth, requireRole("manager", "dispatcher"), handler);
 */
export function requireRole(...roles: FleetRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = req.user?.role as FleetRole | undefined;

    if (!userRole) {
      logger.warn(
        { userId: req.user?.id, path: req.originalUrl },
        "Role check failed: no role assigned",
      );
      res
        .status(403)
        .json({ error: "Forbidden", message: "No role assigned to user" });
      return;
    }

    if (!roles.includes(userRole)) {
      logger.warn(
        {
          userId: req.user?.id,
          userRole,
          requiredRoles: roles,
          path: req.originalUrl,
        },
        "Role check failed: insufficient permissions",
      );
      res.status(403).json({
        error: "Forbidden",
        message: `Requires one of: ${roles.join(", ")}`,
      });
      return;
    }

    next();
  };
}
