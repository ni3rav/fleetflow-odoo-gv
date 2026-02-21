import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Truck, BarChart3, ShieldCheck, Zap } from "lucide-react"
import { useEffect, useState } from "react"

function FluidBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <>
      <style>
        {`
          @keyframes fluid {
            0% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(50px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0, 0) scale(1); }
          }
          .animate-fluid-1 { animation: fluid 15s ease-in-out infinite alternate; }
          .animate-fluid-2 { animation: fluid 18s ease-in-out infinite alternate-reverse; }
          .animate-fluid-3 { animation: fluid 20s ease-in-out infinite alternate; animation-delay: -5s; }
        `}
      </style>
      <div className="fixed inset-0 -z-10 bg-background overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-[100%] bg-primary/20 blur-[120px] opacity-60 animate-fluid-1" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-[100%] bg-blue-500/20 blur-[130px] opacity-60 animate-fluid-2" />
        <div className="absolute top-[20%] right-[15%] w-[40%] h-[40%] rounded-[100%] bg-cyan-400/20 blur-[100px] opacity-60 animate-fluid-3" />

        <div
          className="absolute inset-0 z-0 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.15), transparent 40%)`,
          }}
        />

        <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.8\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/%3E%3C/svg%3E')" }}></div>
      </div >
    </>
  );
}

export function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <FluidBackground />
      <header className="fixed top-0 z-50 w-full border-b border-border/20 bg-background/20 backdrop-blur-2xl">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between mx-auto px-4 md:px-8">
          <div className="flex items-center gap-2 text-primary">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Truck className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">FleetFlow</span>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-2">
              <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground">
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Get Started</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="space-y-6 pb-8 pt-16 md:pb-12 md:pt-24 lg:py-32">
          <div className="container flex max-w-[64rem] flex-col items-center gap-6 text-center mx-auto px-4">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <Zap className="mr-1 h-4 w-4" />
              <span className="hidden sm:inline">Introducing FleetFlow 2.0.</span>
              <span className="sm:hidden">New version out now.</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Modern Operations for the <br className="hidden sm:inline" />
              <span className="text-primary">Next-Gen Fleet.</span>
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Command, track, and optimize every vehicle and driver in your arsenal. The all-in-one open-source solution designed for scalability and speed.
            </p>
            <div className="space-x-4">
              <Button asChild size="lg" className="h-12 px-8">
                <Link to="/signup">Start Free Trial</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-8">
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="container space-y-16 py-16 md:py-24 mx-auto px-4">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">Features that deliver</h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Everything the modern dispatcher needs. Nothing they don't.
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-6 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
            <div className="relative overflow-hidden rounded-lg border bg-background p-2 text-left">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6 border border-border/50 bg-muted/20">
                <Truck className="h-10 w-10 text-primary mb-4" />
                <div className="space-y-2">
                  <h3 className="font-bold">Vehicle Registry</h3>
                  <p className="text-sm text-muted-foreground">Comprehensive tracking of your entire physical asset fleet.</p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-2 text-left">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6 border border-border/50 bg-muted/20">
                <ShieldCheck className="h-10 w-10 text-primary mb-4" />
                <div className="space-y-2">
                  <h3 className="font-bold">Maintenance Logs</h3>
                  <p className="text-sm text-muted-foreground">Keep your fleet healthy with preventative scheduling and service logs.</p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-2 text-left">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6 border border-border/50 bg-muted/20">
                <BarChart3 className="h-10 w-10 text-primary mb-4" />
                <div className="space-y-2">
                  <h3 className="font-bold">Advanced Analytics</h3>
                  <p className="text-sm text-muted-foreground">Turn raw logistical data into actionable financial KPIs.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 py-6 md:py-0 relative z-10 bg-background/40 backdrop-blur-sm">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-16 md:flex-row mx-auto px-4">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; 2026 FleetFlow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
