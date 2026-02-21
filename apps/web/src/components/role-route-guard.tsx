import { Outlet, Navigate } from "react-router-dom";
import { useHasRole, type FleetRole } from "@/hooks/use-role";

type RoleRouteGuardProps = {
  allowedRoles: FleetRole[];
};

/**
 * Renders child route if user has one of the allowed roles; otherwise redirects to Command Center.
 * Use for routes that match backend RBAC (e.g. Dispatch, Maintenance, Analytics).
 */
export function RoleRouteGuard({ allowedRoles }: RoleRouteGuardProps) {
  const hasRole = useHasRole(allowedRoles);
  if (!hasRole) {
    return <Navigate to="/command" replace />;
  }
  return <Outlet />;
}
