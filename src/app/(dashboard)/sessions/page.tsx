"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FolderOpen, Plus, Search, Calendar, Folder, Target, Award } from "lucide-react";
import { DatabaseManager } from "@/lib/mock-data";
import { TradingSession } from "@/types";

export default function SessionsPage() {
  const [sessions, setSessions] = useState<TradingSession[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setSessions(DatabaseManager.getSessions());
  }, []);

  const filteredSessions = sessions.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.notes.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isClient) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
            Sesi Backtest
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Catat, evaluasi, dan simulasikan data trading historis Anda dalam kelompok sesi terstruktur.
          </p>
        </div>
        <Link
          href="/sessions/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent-violet hover:from-primary-hover hover:to-primary text-white text-sm font-medium transition-all shadow-lg shadow-primary/10 hover:scale-[1.02] active:scale-[0.98] self-start"
        >
          <Plus className="w-4 h-4" />
          Sesi Baru
        </Link>
      </div>

      {/* Control bar */}
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari sesi backtest..."
          className="w-full bg-zinc-900/50 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none transition-all placeholder:text-zinc-600"
        />
      </div>

      {/* Grid of Sessions */}
      {filteredSessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((session) => (
            <Link 
              key={session.id}
              href={`/sessions/${session.id}`}
              className="glass rounded-2xl border border-white/5 p-6 flex flex-col justify-between hover:border-indigo-500/20 hover:shadow-[0_0_20px_-5px_rgba(99,102,241,0.15)] transition-all group duration-300 relative overflow-hidden"
            >
              {/* Glow indicator for active session */}
              {session.status === "active" && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    session.status === "active" 
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                      : "bg-zinc-800/40 text-zinc-400 border border-zinc-700/30"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${session.status === "active" ? "bg-emerald-400 animate-pulse" : "bg-zinc-500"}`} />
                    {session.status === "active" ? "Aktif" : "Selesai"}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(session.date).toLocaleDateString("id-ID", { month: 'short', year: 'numeric' })}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors line-clamp-1">{session.name}</h3>
                  <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2 min-h-[32px]">{session.notes || "Tidak ada catatan sesi."}</p>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-zinc-900/60 text-center">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-zinc-500 block uppercase font-medium">Trades</span>
                  <span className="text-sm font-bold text-white font-mono">{session.totalTrades}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-zinc-500 block uppercase font-medium">Win Rate</span>
                  <span className="text-sm font-bold text-white font-mono text-emerald-400">{session.winRate}%</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-zinc-500 block uppercase font-medium">Profit</span>
                  <span className={`text-sm font-bold font-mono ${session.netProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {session.netProfit >= 0 ? "+" : ""}${session.netProfit}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl border border-white/5 flex flex-col items-center justify-center py-16 text-center">
          <FolderOpen className="w-16 h-16 text-zinc-700 mb-4 animate-pulse" />
          <h3 className="text-lg font-bold text-white">Belum Ada Sesi</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm">
            Buat sesi backtest baru untuk mulai mencatat trade log historis berdasarkan timeframe dan instrumen tertentu.
          </p>
          <Link
            href="/sessions/new"
            className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
            Mulai Sesi Baru
          </Link>
        </div>
      )}
    </div>
  );
}
