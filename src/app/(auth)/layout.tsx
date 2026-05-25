import React from "react";
import Link from "next/link";
import { TrendingUp } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden bg-gradient-to-b from-slate-950 via-zinc-950 to-indigo-950 text-foreground">
      {/* Background Dot Grid */}
      <div className="absolute inset-0 dot-grid opacity-80 pointer-events-none z-0" />

      {/* Decorative Glowing Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full bg-indigo-500/10 blur-[80px] sm:blur-[120px] pointer-events-none z-0 animate-pulse-glow" />
      <div className="absolute bottom-1/4 left-1/3 w-[250px] h-[250px] rounded-full bg-cyan-500/5 blur-[80px] pointer-events-none z-0" />

      {/* Header */}
      <header className="relative w-full px-6 py-6 flex items-center justify-between z-10">
        <Link 
          href="/" 
          className="flex items-center gap-2 group transition-all duration-300"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-accent-cyan p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-zinc-950">
              <TrendingUp className="h-5 w-5 text-accent-cyan group-hover:text-primary transition-colors duration-300" />
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent group-hover:from-white group-hover:via-accent-cyan group-hover:to-primary transition-all duration-300">
            Trade<span className="text-primary font-extrabold">Log</span>
          </span>
        </Link>
        <Link 
          href="/"
          className="text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10"
        >
          Kembali ke Beranda
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="relative flex flex-col items-center justify-center flex-grow px-4 py-8 z-10">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative w-full py-6 px-6 text-center text-xs text-zinc-500 border-t border-white/5 z-10">
        <p>&copy; {new Date().getFullYear()} TradeLog. Semua hak cipta dilindungi undang-undang.</p>
      </footer>
    </div>
  );
}
