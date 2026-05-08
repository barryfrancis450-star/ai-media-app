import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Image as ImageIcon, Grid, Layers, Sparkles } from "lucide-react";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row w-full overflow-hidden text-foreground">
      <aside className="w-full md:w-64 border-r border-border/40 bg-card/50 flex flex-col backdrop-blur-xl shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="font-semibold text-lg tracking-tight">Ocular AI</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 flex flex-col mt-4">
          <Link
            href="/"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
              location === "/" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            }`}
          >
            <Layers className="h-4 w-4" />
            Generator
          </Link>
          <Link
            href="/gallery"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
              location === "/gallery" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            }`}
          >
            <Grid className="h-4 w-4" />
            Gallery
          </Link>
        </nav>

        <div className="p-6 mt-auto">
          <div className="bg-white/5 p-4 rounded-xl border border-border/50">
            <p className="text-xs text-muted-foreground mb-2">Powered by</p>
            <p className="text-sm font-medium text-foreground flex items-center gap-2">
              GPT Image-1 <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
            </p>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto h-screen relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background -z-10 pointer-events-none"></div>
        {children}
      </main>
    </div>
  );
}
