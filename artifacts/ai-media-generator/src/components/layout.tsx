import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Layers, Grid, Sparkles, LogOut, ChevronDown } from "lucide-react";
import { useUser, useClerk, Show } from "@clerk/react";
import { useState } from "react";

function UserMenu() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const displayName = user.fullName || user.primaryEmailAddress?.emailAddress || "Account";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group"
        data-testid="user-menu-button"
      >
        {user.imageUrl ? (
          <img
            src={user.imageUrl}
            alt={displayName}
            className="h-8 w-8 rounded-full object-cover ring-2 ring-white/10"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white/10">
            {initials}
          </div>
        )}
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
          <p className="text-xs text-muted-foreground truncate">
            {user.primaryEmailAddress?.emailAddress}
          </p>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-zinc-900 border border-white/10 rounded-xl shadow-xl shadow-black/40 overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-xs text-muted-foreground">Signed in as</p>
            <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-white/5 transition-colors"
            data-testid="sign-out-button"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

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

        <nav className="flex-1 px-4 space-y-1 flex flex-col mt-2">
          <Link
            href="/studio"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
              location === "/studio"
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            }`}
          >
            <Layers className="h-4 w-4" />
            Generator
          </Link>
          <Link
            href="/gallery"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
              location === "/gallery"
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            }`}
          >
            <Grid className="h-4 w-4" />
            Gallery
          </Link>
        </nav>

        <div className="p-4 mt-auto space-y-3">
          <div className="bg-white/5 px-4 py-3 rounded-xl border border-border/50">
            <p className="text-xs text-muted-foreground mb-1">Powered by</p>
            <p className="text-sm font-medium text-foreground flex items-center gap-2">
              GPT Image-1
              <span className="flex h-2 w-2 rounded-full bg-green-500" />
            </p>
          </div>

          <Show when="signed-in">
            <UserMenu />
          </Show>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto h-screen relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background -z-10 pointer-events-none" />
        {children}
      </main>
    </div>
  );
}
