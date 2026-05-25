"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  ChevronDown,
  Moon,
  LogOut,
  User,
  Settings,
  ChevronRight,
  Menu,
  Sun
} from "lucide-react";
import { DatabaseManager } from "@/lib/mock-data";
import { UserProfile } from "@/types";

interface HeaderProps {
  onMenuToggle?: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Hardcoded email for mock details
  const email = "alex.rivera@tradelog.com";

  useEffect(() => {
    setProfile(DatabaseManager.getProfile());
  }, []);

  // Handle clicking outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("tradelog_logged_in");
    }
    router.push("/");
  };

  // Generate dynamic breadcrumbs
  const getBreadcrumbs = () => {
    const paths = pathname.split("/").filter(Boolean);
    
    return (
      <div className="flex items-center gap-1.5 text-xs md:text-sm font-medium text-muted">
        <Link href="/dashboard" className="hover:text-foreground transition-colors">
          TradeLog
        </Link>
        {paths.map((path, index) => {
          const href = `/${paths.slice(0, index + 1).join("/")}`;
          const isLast = index === paths.length - 1;
          const label = path.charAt(0).toUpperCase() + path.slice(1);
          
          return (
            <div key={href} className="flex items-center gap-1.5">
              <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
              {isLast ? (
                <span className="text-foreground font-semibold truncate max-w-[120px] md:max-w-none">{label}</span>
              ) : (
                <Link href={href} className="hover:text-foreground transition-colors truncate max-w-[120px] md:max-w-none">
                  {label}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-30 w-full h-16 glass border-b border-white/5 bg-zinc-950/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6">
      {/* Left side: Breadcrumb & Mobile Menu Toggle */}
      <div className="flex items-center gap-4">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="md:hidden p-1.5 rounded-lg hover:bg-white/5 text-muted hover:text-foreground transition-colors"
            aria-label="Toggle mobile menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="hidden sm:block">{getBreadcrumbs()}</div>
        <div className="sm:hidden text-sm font-semibold tracking-tight text-foreground">
          {pathname.split("/").filter(Boolean).pop()?.toUpperCase() || "DASHBOARD"}
        </div>
      </div>

      {/* Right side: Notifications, Theme Indicator, Profile Menu */}
      <div className="flex items-center gap-3">
        {/* Mock Theme Switcher (Dark Mode Locked) */}
        <div className="flex items-center justify-center p-2 rounded-xl bg-white/5 border border-white/5 text-primary hover:text-primary-hover transition-colors cursor-pointer group" title="Dark Mode Active">
          <Moon className="w-4 h-4 transition-transform group-hover:rotate-12" />
          <span className="hidden lg:inline text-xs font-semibold ml-2 text-muted select-none group-hover:text-foreground transition-colors">
            Dark Mode
          </span>
        </div>

        {/* Notifications Icon (Mock) */}
        <button className="p-2 rounded-xl bg-white/5 border border-white/5 text-muted hover:text-foreground hover:bg-white/10 transition-all duration-200 relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
        </button>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1 md:p-1.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all duration-200"
          >
            <div className="w-7 h-7 rounded-full overflow-hidden border border-white/10">
              <img
                src={profile?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"}
                alt={profile?.displayName || "Alex Rivera"}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="hidden md:inline text-sm font-medium text-foreground">
              {profile?.displayName || "Alex Rivera"}
            </span>
            <ChevronDown className={`w-4 h-4 text-muted transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl glass border border-white/10 bg-zinc-950 shadow-2xl p-1.5 animate-fade-up z-50">
              <div className="px-3 py-2.5 border-b border-white/5">
                <p className="text-xs text-muted">Signed in as</p>
                <p className="text-sm font-semibold text-foreground truncate">{profile?.displayName || "Alex Rivera"}</p>
                <p className="text-[11px] text-muted truncate mt-0.5">{email}</p>
              </div>

              <div className="p-1 space-y-0.5">
                <Link
                  href="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-2 text-sm text-muted hover:text-foreground rounded-lg hover:bg-white/5 transition-all"
                >
                  <User className="w-4 h-4" />
                  <span>My Profile</span>
                </Link>
                <Link
                  href="/profile?tab=settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-2 text-sm text-muted hover:text-foreground rounded-lg hover:bg-white/5 transition-all"
                >
                  <Settings className="w-4 h-4" />
                  <span>Account Settings</span>
                </Link>
              </div>

              <div className="p-1 border-t border-white/5">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    handleLogout();
                  }}
                  className="flex w-full items-center gap-2 px-2.5 py-2 text-sm text-accent-rose hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-all text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
