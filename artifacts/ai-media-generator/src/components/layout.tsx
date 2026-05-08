import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Image as ImageIcon, Video, Mic, Home } from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/image", label: "AI Image", icon: ImageIcon },
  { href: "/video", label: "AI Video", icon: Video },
  { href: "/voice", label: "AI Voice", icon: Mic },
];

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-black text-white flex">
      <aside className="w-64 bg-zinc-950 p-6 hidden md:flex flex-col gap-6 border-r border-zinc-800 shrink-0">
        <h2 className="text-xl font-bold text-purple-500">AI Studio</h2>

        <nav className="flex flex-col gap-2">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                location === href
                  ? "bg-purple-600/20 text-purple-400"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto">
          <div className="bg-white/5 p-4 rounded-xl border border-zinc-800">
            <p className="text-xs text-gray-500 mb-1">Powered by</p>
            <p className="text-sm font-medium flex items-center gap-2">
              GPT Image-1 <span className="h-2 w-2 rounded-full bg-green-500 inline-block" />
            </p>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto h-screen">
        {children}
      </main>
    </div>
  );
}
