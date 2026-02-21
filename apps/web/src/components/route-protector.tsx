import { Outlet } from "react-router-dom";

import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";

export function RouteProtector() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Spinner />
      </div>
    );
  }

  if (!session) {
    // Temporarily disabled for UI development to avoid infinite loops when backend is down
    // return <Navigate to="/" replace state={{ from: location }} />;
    console.warn("No active session detected. Bypassing RouteProtector for UI Development.");
  }

  return <Outlet />;
}
