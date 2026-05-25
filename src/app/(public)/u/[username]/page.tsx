"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Layers, Calendar, Globe, Award, Target, Trophy, ChevronRight } from "lucide-react";
import { getPublicProfileByUsername } from "@/lib/actions/public";

type PublicProfileData = {
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  publicMethods: any[];
  stats: {
    totalTrades: number;
    winRate: number;
    avgR: number;
    consistencyScore: number;
    totalMethods: number;
    totalSessions: number;
  };
};

export default function PublicProfilePage() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Parse username from URL: e.g. /u/trader_legend
    const segments = pathname.split("/");
    const username = segments[segments.length - 1];

    if (username) {
      async function loadProfile() {
        try {
          const data = await getPublicProfileByUsername(username);
          setProfile(data as PublicProfileData);
        } catch (error) {
          console.error("Failed to load public profile:", error);
        } finally {
          setIsLoading(false);
        }
      }
      loadProfile();
    }
  }, [pathname]);

  if (!isClient) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-16 space-y-4">
        <h3 className="text-lg font-bold text-white">Trader tidak ditemukan</h3>
        <Link href="/leaderboard" className="text-primary hover:underline text-xs font-semibold">
          Kembali ke Leaderboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-up">
      {/* Trader Banner Card */}
      <div className="glass rounded-3xl border border-white/5 p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden bg-zinc-950/20">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        {profile.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt={profile.displayName}
            className="w-24 h-24 rounded-2xl object-cover border border-zinc-800 ring-4 ring-primary/10 shrink-0"
          />
        ) : (
          <div className="w-24 h-24 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center font-bold text-3xl shrink-0 border border-zinc-850">
            {profile.displayName.charAt(0)}
          </div>
        )}

        <div className="space-y-3.5 text-center sm:text-left flex-1">
          <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2.5">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              TRADER
            </span>
            <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Member sejak Jan 2026
            </span>
          </div>

          <div>
            <h1 className="text-2xl font-extrabold text-white">{profile.displayName}</h1>
            <p className="text-sm text-zinc-500 font-medium">@{profile.username}</p>
          </div>

          <p className="text-sm text-zinc-400 leading-relaxed max-w-xl">
            {profile.bio || "Trader ini belum memperbarui biografi akunnya."}
          </p>
        </div>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass rounded-2xl border border-white/5 p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Consistency Score</span>
            <span className="text-xl font-bold text-white">{profile.stats.consistencyScore.toFixed(1)}</span>
          </div>
        </div>

        <div className="glass rounded-2xl border border-white/5 p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Win Rate</span>
            <span className="text-xl font-bold text-white">{profile.stats.winRate.toFixed(1)}%</span>
          </div>
        </div>

        <div className="glass rounded-2xl border border-white/5 p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Avg R</span>
            <span className="text-xl font-bold text-white">+{profile.stats.avgR.toFixed(2)} R</span>
          </div>
        </div>
      </div>

      {/* Published Methods Grid */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white">Metode yang Dipublikasikan</h2>
          <p className="text-xs text-zinc-500">Mempelajari pendekatan teknikal trader ini.</p>
        </div>

        {profile.publicMethods && profile.publicMethods.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profile.publicMethods.map((m) => (
              <div 
                key={m.id}
                className="glass rounded-2xl border border-white/5 p-6 flex flex-col justify-between hover:border-zinc-800 transition-all relative overflow-hidden group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Globe className="w-3.5 h-3.5" />
                      PUBLIK
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors">
                      {m.name}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3 mt-1.5 min-h-[48px]">
                      {m.description || "Tidak ada deskripsi."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-900/60">
                  <div className="flex gap-4 text-xs font-mono font-medium text-zinc-500">
                    <div className="text-[10px]">
                      Timeframes: <span className="text-zinc-300 font-semibold">{m.timeframes?.map((tf: any) => tf.timeframe).join(", ") || "-"}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass rounded-2xl border border-white/5 flex flex-col items-center justify-center py-12 text-center">
            <Layers className="w-12 h-12 text-zinc-700 mb-3" />
            <h4 className="text-zinc-300 font-bold">Belum mempublikasikan metode</h4>
            <p className="text-xs text-zinc-500 mt-1 max-w-[280px]">Trader ini belum membagikan metode trading publik apapun saat ini.</p>
          </div>
        )}
      </div>
    </div>
  );
}
