"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  TrendingUp, 
  Layers, 
  BarChart3, 
  Trophy, 
  User, 
  Menu, 
  X, 
  LogOut,
  FolderOpen
} from "lucide-react";
import { DatabaseManager } from "@/lib/mock-data";
import { UserProfile } from "@/types";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Load profile from DatabaseManager
    setProfile(DatabaseManager.getProfile());
  }, []);

  const navItems = [
    { name: "Sesi Backtest", href: "/sessions", icon: FolderOpen },
    { name: "Metode Teknikal", href: "/methods", icon: Layers },
    { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
    { name: "Profil Saya", href: "/profile", icon: User },
  ];

  return (
    <div className="relative min-h-screen w-full flex bg-[#09090b] text-zinc-100 overflow-x-hidden font-sans">
      {/* Glow Effects */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none z-0" />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-zinc-800/80 bg-zinc-950/40 backdrop-blur-md z-30 shrink-0">
        {/* Brand */}
        <div className="px-6 py-6 border-b border-zinc-900 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/10 group-hover:scale-105 transition-transform duration-300">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-zinc-950">
                <TrendingUp className="h-5 w-5 text-cyan-400 group-hover:text-indigo-400 transition-colors duration-300" />
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent group-hover:from-white group-hover:via-cyan-400 group-hover:to-indigo-400 transition-all duration-300">
              Trade<span className="text-indigo-500 font-extrabold">Log</span>
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_-3px_rgba(99,102,241,0.15)]"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50 border border-transparent"
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? "text-indigo-400" : "text-zinc-400 group-hover:text-zinc-100"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Profile Footer */}
        {profile && (
          <div className="p-4 border-t border-zinc-900 bg-zinc-950/60">
            <div className="flex items-center gap-3 p-2 rounded-xl bg-zinc-900/30 border border-zinc-800/40">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.displayName}
                  className="w-10 h-10 rounded-lg object-cover ring-1 ring-zinc-800"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-indigo-600/20 flex items-center justify-center text-indigo-400 font-bold">
                  {profile.displayName.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-zinc-200 truncate">{profile.displayName}</p>
                <p className="text-[10px] text-zinc-500 truncate">@{profile.username}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Header */}
      <div className="flex flex-col flex-1 min-w-0 relative z-10">
        <header className="md:hidden flex items-center justify-between px-6 py-4 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-400 p-0.5">
              <div className="flex h-full w-full items-center justify-center rounded-[6px] bg-zinc-950">
                <TrendingUp className="h-4 w-4 text-cyan-400" />
              </div>
            </div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Trade<span className="text-indigo-400 font-extrabold">Log</span>
            </span>
          </Link>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-[65px] bg-[#09090b]/95 backdrop-blur-lg z-35 flex flex-col p-6 space-y-6">
            <nav className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all ${
                      isActive
                        ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20"
                        : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50 border border-transparent"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {profile && (
              <div className="mt-auto p-4 rounded-2xl bg-zinc-950 border border-zinc-900 flex items-center gap-3">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.displayName}
                    className="w-12 h-12 rounded-xl object-cover ring-1 ring-zinc-800"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 font-bold text-lg">
                    {profile.displayName.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-zinc-200">{profile.displayName}</p>
                  <p className="text-xs text-zinc-500">@{profile.username}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Content Panel */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
