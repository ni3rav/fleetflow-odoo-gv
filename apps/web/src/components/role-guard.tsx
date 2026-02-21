import type { ReactNode } from "react";
import { useHasRole, type FleetRole } from "@/hooks/use-role";

type RoleGuardProps = {
  roles: FleetRole[];
  children: ReactNode;
  fallback?: ReactNode;
};

/**
 * Renders children only when the current user has one of the given roles.
 * Otherwise renders fallback (or null).
 */
export function RoleGuard({ roles, children, fallback = null }: RoleGuardProps) {
  const hasRole = useHasRole(roles);
  return hasRole ? <>{children}</> : <>{fallback}</>;
}
