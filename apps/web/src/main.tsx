import { Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { Toaster } from "sonner";
import "./index.css";
import { ThemeProvider } from "@/lib/theme-provider";
import { queryClient } from "@/lib/query-client";
import { Spinner } from "@/components/ui/spinner";
import { RootLayout } from "@/components/root-layout";
import { PageContainer } from "./components/page-container";
import { Button } from "@/components/ui/button";
import { ErrorFallback } from "@/components/error-fallback";
import { RouteProtector } from "@/components/route-protector";
import { DashboardPage } from "@/components/dashboard-page";
import { VehicleRegistryPage } from "@/components/features/fleet/vehicle-registry-page";
import { DispatchPage } from "@/components/features/dispatch/dispatch-page";
import { MaintenancePage } from "@/components/features/maintenance/maintenance-page";
import { ExpensesPage } from "@/components/features/expenses/expenses-page";
import { DriversPage } from "@/components/features/drivers/drivers-page";
import { AnalyticsPage } from "@/components/features/analytics/analytics-page";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DemoPage } from "@/page/demo";

// eslint-disable-next-line react-refresh/only-export-components
const NotFoundPage = () => {
  return (
    <PageContainer className="min-h-screen min-w-screen flex justify-center items-center gap-5 text-4xl">
      <>
        Page could not be found
        <Button>
          <Link to="/">Go Home</Link>
        </Button>
      </>
    </PageContainer>
  );
};

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary
    FallbackComponent={ErrorFallback}
    onReset={() => (window.location.href = "/")}
    onError={(error, info) => {
      console.error("Error caught by boundary:", error, info);
    }}
  >
    <TooltipProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system">
          <BrowserRouter>
            <Toaster position="top-center" richColors />
            <Suspense
              fallback={
                <PageContainer className="grid place-items-center min-h-screen">
                  <Spinner />
                </PageContainer>
              }
            >
              <Routes>
                <Route path="/" element={<RootLayout />}>
                  <Route element={<RouteProtector />}>
                    <Route index element={<DashboardPage />} />
                    <Route path="fleet" element={<VehicleRegistryPage />} />
                    <Route path="dispatch" element={<DispatchPage />} />
                    <Route path="maintenance" element={<MaintenancePage />} />
                    <Route path="expenses" element={<ExpensesPage />} />
                    <Route path="drivers" element={<DriversPage />} />
                    <Route path="analytics" element={<AnalyticsPage />} />
                    <Route path="settings" element={<DashboardPage />} />
                  </Route>
                  <Route path="demo" element={<DemoPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ThemeProvider>
      </QueryClientProvider>
    </TooltipProvider>
  </ErrorBoundary>,
);
