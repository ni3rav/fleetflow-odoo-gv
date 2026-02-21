import { Outlet } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export function RootLayout() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}
