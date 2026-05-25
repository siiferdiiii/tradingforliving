"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Hourglass,
  BarChart3,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
  TrendingUp
} from "lucide-react";
import { DatabaseManager } from "@/lib/mock-data";
import { UserProfile } from "@/types";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Fetch profile on mount
    setProfile(DatabaseManager.getProfile());
  }, []);

  const handleLogout = () => {
    // Clear mock auth
    if (typeof window !== "undefined") {
      localStorage.removeItem("tradelog_logged_in");
    }
    router.push("/");
  };

  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Methods",
      href: "/methods",
      icon: BookOpen,
    },
    {
      label: "Sessions",
      href: "/sessions",
      icon: Hourglass,
    },
    {
      label: "Analytics",
      href: "/analytics",
      icon: BarChart3,
    },
    {
      label: "Profile",
      href: "/profile",
      icon: User,
    },
  ];

  return (
    <aside
      className={`fixed md:sticky top-0 left-0 z-40 h-screen glass border-r border-white/5 flex flex-col justify-between transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      } bg-zinc-950/90 text-foreground`}
    >
      {/* Sidebar Header */}
      <div>
        <div className="flex items-center justify-between p-4 h-16 border-b border-white/5">
          <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent-cyan flex items-center justify-center shadow-lg shadow-primary/20">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            {!isCollapsed && (
              <span className="text-lg font-bold tracking-tight whitespace-nowrap animate-fade-up">
                Trade<span className="gradient-text">Log</span>
              </span>
            )}
          </Link>
          
          {/* Collapse/Expand Toggle Button on Desktop */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-1.5 rounded-lg hover:bg-white/5 border border-white/5 hover:border-white/10 text-muted hover:text-foreground transition-all duration-200"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="p-2 space-y-1.5 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 relative group overflow-hidden ${
                  isActive
                    ? "bg-primary/10 text-primary font-semibold border-l-2 border-primary"
                    : "text-muted hover:text-foreground hover:bg-white/5 border-l-2 border-transparent"
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? "text-primary" : "text-muted"}`} />
                {!isCollapsed && (
                  <span className="text-sm whitespace-nowrap animate-fade-up">{item.label}</span>
                )}
                
                {/* Tooltip for collapsed mode */}
                {isCollapsed && (
                  <div className="absolute left-14 scale-0 group-hover:scale-100 transition-all duration-200 bg-zinc-900 border border-white/10 text-xs px-2.5 py-1.5 rounded-lg shadow-xl pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer / User Profile */}
      <div className="p-3 border-t border-white/5 bg-zinc-950/40">
        {!isCollapsed ? (
          <div className="flex items-center justify-between gap-2 p-1">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
                <img
                  src={profile?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"}
                  alt={profile?.displayName || "Alex Rivera"}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col text-left overflow-hidden">
                <span className="text-xs font-semibold text-foreground truncate">
                  {profile?.displayName || "Alex Rivera"}
                </span>
                <span className="text-[10px] text-muted truncate">
                  @{profile?.username || "trader_legend"}
                </span>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-rose-500/10 text-muted hover:text-accent-rose transition-all duration-200 group/btn"
              title="Logout"
            >
              <LogOut className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/10">
              <img
                src={profile?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"}
                alt={profile?.displayName || "Alex Rivera"}
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-rose-500/10 text-muted hover:text-accent-rose transition-all duration-200"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
