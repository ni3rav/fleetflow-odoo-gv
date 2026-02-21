import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Truck, ShieldCheck, ArrowRight, Activity } from "lucide-react"
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
          @keyframes float {
            0% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
            100% { transform: translateY(0px) rotate(0deg); }
          }
          @keyframes pulse-slow {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 0.8; }
          }
          @keyframes grid-fade {
            0% { opacity: 0.1; transform: translateY(0); }
            100% { opacity: 0.3; transform: translateY(50px); }
          }
           @keyframes fluid {
            0% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(50px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0, 0) scale(1); }
          }
          .animate-fluid-1 { animation: fluid 25s ease-in-out infinite alternate; }
          .animate-fluid-2 { animation: fluid 30s ease-in-out infinite alternate-reverse; }
          .animate-fluid-3 { animation: fluid 35s ease-in-out infinite alternate; animation-delay: -5s; }
        `}
      </style>
      <div className="fixed inset-0 -z-10 bg-[#020817] overflow-hidden">
        {/* Deep Ambient Glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-[100%] bg-blue-600/20 blur-[120px] mix-blend-screen animate-fluid-1" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-[100%] bg-indigo-600/20 blur-[150px] mix-blend-screen animate-fluid-2" />
        <div className="absolute top-[20%] right-[15%] w-[40%] h-[40%] rounded-[100%] bg-purple-600/15 blur-[100px] mix-blend-screen animate-fluid-3" />

        {/* Interactive Mouse Glow */}
        <div
          className="absolute inset-0 z-0 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.1), transparent 40%)`,
          }}
        />

        {/* Cyber Grid Overlay */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: `4rem 4rem`,
            maskImage: `radial-gradient(ellipse 60% 60% at 50% 50%, #000 0%, transparent 100%)`,
            WebkitMaskImage: `radial-gradient(ellipse 60% 60% at 50% 50%, #000 0%, transparent 100%)`,
          }}
        />

        {/* Noise Texture */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.8\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/%3E%3C/svg%3E')" }}></div>
      </div >
    </>
  );
}

const heroImages = [
  "/feat-dash.png",
  "/feat-map.png",
  "/feat-analytics.png",
  "/feat-table.png",
  "/feat-drivers.png",
];

export function LandingPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden text-slate-50 selection:bg-primary/30">
      <FluidBackground />

      <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-background/10 backdrop-blur-xl">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between mx-auto px-4 md:px-8">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_0_20px_rgba(59,130,246,0.4)] group-hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] transition-all">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              FleetFlow
            </span>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-4">
              <Button asChild variant="ghost" className="text-white/70 hover:text-white hover:bg-white/5">
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild className="bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.1)] rounded-full px-6 transition-all hover:scale-105 active:scale-95">
                <Link to="/signup">Get Started <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center w-full">
        {/* Hero Section */}
        <section className="relative w-full pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden flex flex-col items-center justify-center min-h-[85vh]">

          <div className="container relative z-10 mx-auto px-4 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

              {/* Left Column: Text & CTA */}
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                {/* Supercharged Badge */}
                <div className="inline-flex items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-300 backdrop-blur-md shadow-[0_0_30px_rgba(59,130,246,0.2)] mb-8" style={{ animation: 'float 6s ease-in-out infinite' }}>
                  <span className="flex h-2 w-2 rounded-full bg-blue-400 mr-2" style={{ animation: 'pulse-slow 2s infinite' }}></span>
                  Introducing FleetFlow 2.0
                </div>

                {/* Massive Gradient Text */}
                <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-7xl w-full mb-6 leading-[1.1]">
                  <span className="block text-white/90 drop-shadow-sm mb-2">Modern Operations</span>
                  <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 drop-shadow-[0_0_30px_rgba(59,130,246,0.3)] pb-2">
                    Next-Gen Fleet.
                  </span>
                </h1>

                <p className="max-w-[42rem] text-lg text-slate-400 sm:text-xl sm:leading-8 font-light mb-10">
                  Command, track, and optimize every vehicle and driver in your arsenal. The all-in-one scalable solution built for complex logistics.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <Button asChild size="lg" className="h-14 px-8 text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-full shadow-[0_0_40px_rgba(59,130,246,0.4)] hover:shadow-[0_0_60px_rgba(59,130,246,0.6)] transition-all hover:-translate-y-1">
                    <Link to="/signup">Start Free Trial <ArrowRight className="ml-2 h-5 w-5" /></Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="h-14 px-8 text-base border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-full backdrop-blur-md transition-all hover:-translate-y-1">
                    <Link to="/login">Sign In</Link>
                  </Button>
                </div>
              </div>

              {/* Right Column: Hero Image / UI Mockup */}
              <div className="relative w-full max-w-[600px] mx-auto lg:max-w-none flex justify-center lg:justify-end perspective-1000">
                {/* Decorative Glow Behind Image */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue-500/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none" />

                <div
                  className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-square max-h-[600px] rounded-2xl overflow-hidden border border-white/10 bg-[#020817] shadow-[0_0_50px_rgba(59,130,246,0.3)]"
                  style={{
                    transform: "rotateY(-20deg) rotateX(10deg) scale(0.95)",
                    transformStyle: "preserve-3d",
                    transition: "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "rotateY(-5deg) rotateX(2deg) scale(1.02)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "rotateY(-20deg) rotateX(10deg) scale(0.95)";
                  }}
                >
                  {/* Desktop Frame Top Bar */}
                  <div className="absolute top-0 left-0 w-full h-10 bg-black/60 backdrop-blur-md flex items-center px-4 gap-2 z-20 border-b border-white/10">
                    <div className="w-3 h-3 rounded-full bg-red-500/80 shadow-[0_0_5px_rgba(239,68,68,0.5)]"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-[0_0_5px_rgba(234,179,8,0.5)]"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80 shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div>
                    <div className="mx-auto text-xs text-white/40 font-medium tracking-widest uppercase">app.fleetflow.io</div>
                  </div>

                  {/* Carousel Images */}
                  <div className="relative w-full h-full pt-10">
                    {heroImages.map((src, index) => (
                      <img
                        key={src}
                        src={src}
                        alt={`FleetFlow UI Feature ${index + 1}`}
                        className={`absolute top-10 left-0 w-full h-[calc(100%-2.5rem)] object-cover object-top transition-all duration-1000 ease-in-out ${index === currentImageIndex ? "opacity-100 scale-100" : "opacity-0 scale-105"
                          }`}
                      />
                    ))}
                  </div>

                  {/* Glass Reflection Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-white/10 pointer-events-none mix-blend-overlay" />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full relative py-24 mx-auto border-t border-white/5 bg-black/20 backdrop-blur-xl">
          <div className="container mx-auto px-4">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 pb-2">
                Features that deliver
              </h2>
              <p className="max-w-[85%] text-slate-400 sm:text-lg sm:leading-7">
                Everything the modern dispatcher needs. Built specifically for complex logistics.
              </p>
            </div>

            <div className="mx-auto grid justify-center gap-6 sm:grid-cols-2 md:max-w-[72rem] lg:grid-cols-3">

              {/* Feature Card 1 */}
              <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-left transition-all hover:bg-white/[0.04] hover:border-white/10 hover:shadow-[0_0_40px_rgba(59,130,246,0.1)]">
                <div className="absolute top-0 right-0 p-4 opacity-50 transition-transform group-hover:scale-110 group-hover:opacity-100">
                  <div className="h-24 w-24 rounded-full bg-blue-500/20 blur-[50px]"></div>
                </div>
                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30 mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                    <Truck className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-bold text-xl text-white">Vehicle Registry</h3>
                    <p className="text-slate-400 leading-relaxed font-light">Comprehensive real-time tracking of your entire physical asset fleet and driver assignments.</p>
                  </div>
                </div>
              </div>

              {/* Feature Card 2 */}
              <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-left transition-all hover:bg-white/[0.04] hover:border-white/10 hover:shadow-[0_0_40px_rgba(168,85,247,0.1)]">
                <div className="absolute top-0 right-0 p-4 opacity-50 transition-transform group-hover:scale-110 group-hover:opacity-100">
                  <div className="h-24 w-24 rounded-full bg-purple-500/20 blur-[50px]"></div>
                </div>
                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div className="h-12 w-12 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30 mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                    <Activity className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-bold text-xl text-white">Live Dispatch</h3>
                    <p className="text-slate-400 leading-relaxed font-light">Assign routes, optimize loads, and track active deliveries on a unified interactive dashboard.</p>
                  </div>
                </div>
              </div>

              {/* Feature Card 3 */}
              <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-left transition-all hover:bg-white/[0.04] hover:border-white/10 hover:shadow-[0_0_40px_rgba(16,185,129,0.1)]">
                <div className="absolute top-0 right-0 p-4 opacity-50 transition-transform group-hover:scale-110 group-hover:opacity-100">
                  <div className="h-24 w-24 rounded-full bg-emerald-500/20 blur-[50px]"></div>
                </div>
                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                    <ShieldCheck className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-bold text-xl text-white">Compliance & Safety</h3>
                    <p className="text-slate-400 leading-relaxed font-light">Automate license expiry tracking, incident reporting, and driver health check regulations.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-8 relative z-10 bg-[#020817]">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row mx-auto px-6">
          <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
            <Truck className="h-4 w-4 text-white" />
            <span className="text-base font-bold text-white tracking-widest">FLEETFLOW</span>
          </div>
          <p className="text-center text-sm text-slate-500 md:text-left">
            &copy; 2026 FleetFlow Corporation. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

