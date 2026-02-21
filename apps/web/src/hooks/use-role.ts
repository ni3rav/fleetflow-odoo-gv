import { authClient } from "@/lib/auth-client";

export type FleetRole = "manager" | "dispatcher" | "safety_officer" | "analyst";

/**
 * Returns true if the current user's role is one of the allowed roles.
 * Use for conditional rendering (e.g. hide nav items or buttons by role).
 */
export function useHasRole(allowedRoles: FleetRole[]): boolean {
  const { data: session } = authClient.useSession();
  const userRole = (session?.user as { role?: string } | undefined)?.role;
  if (!userRole) return false;
  return allowedRoles.includes(userRole as FleetRole);
}
