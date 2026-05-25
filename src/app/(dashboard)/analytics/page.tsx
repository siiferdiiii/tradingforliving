"use client";

import React, { useState, useEffect } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { DatabaseManager } from "@/lib/mock-data";
import { DashboardStats, Trade } from "@/types";
import { 
  TrendingUp, 
  Target, 
  Award, 
  Compass, 
  Smile, 
  BarChart3,
  Calendar,
  Clock
} from "lucide-react";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "konsep" | "timeframe" | "sesi" | "distribusi_r">("overview");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setStats(DatabaseManager.getStats());
    setTrades(DatabaseManager.getTrades());
  }, []);

  if (!isClient || !stats) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Pre-calculate timeframe stats
  const tfMap: Record<string, { count: number; wins: number }> = {};
  trades.forEach(t => {
    const tf = t.notes?.split(" ").includes("M1") ? "M1" : t.notes?.split(" ").includes("M5") ? "M5" : "M15";
    if (!tfMap[tf]) tfMap[tf] = { count: 0, wins: 0 };
    tfMap[tf].count++;
    if (t.result === "win") tfMap[tf].wins++;
  });
  const timeframeData = Object.entries(tfMap).map(([tf, d]) => ({
    timeframe: tf,
    tradesCount: d.count,
    winRate: parseFloat(((d.wins / d.count) * 100).toFixed(1))
  }));

  // Pre-calculate session stats
  const sesMap: Record<string, { count: number; wins: number }> = {};
  trades.forEach(t => {
    const ses = t.notes?.split(" ").includes("London") ? "LONDON" : "NEW YORK";
    if (!sesMap[ses]) sesMap[ses] = { count: 0, wins: 0 };
    sesMap[ses].count++;
    if (t.result === "win") sesMap[ses].wins++;
  });
  const sessionData = Object.entries(sesMap).map(([ses, d]) => ({
    session: ses,
    tradesCount: d.count,
    winRate: parseFloat(((d.wins / d.count) * 100).toFixed(1))
  }));

  // Calculate R distribution histogram
  const buckets = [-1, 0, 1, 2, 3, 4, 5];
  const rDistribution = buckets.map(b => {
    let count = 0;
    if (b === -1) count = trades.filter(t => t.result === "loss").length;
    else if (b === 0) count = trades.filter(t => t.result === "breakeven").length;
    else count = trades.filter(t => t.result === "win" && Math.round(t.rr) === b).length;
    
    return {
      bucket: b === -1 ? "-1R (Loss)" : b === 0 ? "0R (Scratch)" : `+${b}R`,
      count
    };
  });

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
          Analisis Mendalam
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Identifikasi bias performa, optimalitas durasi entri, akurasi timeframe, dan kestabilan rasio keuntungan Anda.
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-900 pb-px">
        {[
          { id: "overview", label: "Overview", icon: BarChart3 },
          { id: "konsep", label: "Metode", icon: Compass },
          { id: "timeframe", label: "Timeframe", icon: Clock },
          { id: "sesi", label: "Sesi Waktu", icon: Calendar },
          { id: "distribusi_r", label: "Distribusi R", icon: Award }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
                isActive 
                  ? "border-primary text-primary" 
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Filter Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass rounded-2xl border border-white/5 p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Total Trades</span>
            <span className="text-xl font-bold text-white">{stats.totalTrades}</span>
          </div>
        </div>

        <div className="glass rounded-2xl border border-white/5 p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Win Rate Rata-rata</span>
            <span className="text-xl font-bold text-white">{stats.winRate}%</span>
          </div>
        </div>

        <div className="glass rounded-2xl border border-white/5 p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Profit Factor</span>
            <span className="text-xl font-bold text-white">{stats.profitFactor}x</span>
          </div>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="glass rounded-2xl border border-white/5 p-6 min-h-[400px] flex flex-col justify-between relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        {activeTab === "overview" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-base font-bold text-white">Akumulasi Kurva Keuntungan Sesi</h3>
              <p className="text-xs text-zinc-500">Menganalisis momentum penumpukan hasil modal kumulatif.</p>
            </div>

            <div className="h-[300px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.equityCurve}>
                  <defs>
                    <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="date" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      background: "rgba(9, 9, 11, 0.9)", 
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "12px",
                      fontSize: "12px"
                    }}
                  />
                  <Area type="monotone" dataKey="balance" stroke="#818cf8" strokeWidth={2.5} fillOpacity={1} fill="url(#glow)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === "konsep" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-base font-bold text-white">Win Rate Berdasarkan Metode Teknikal</h3>
              <p className="text-xs text-zinc-500">Metode mana yang memiliki probabilitas kemenangan tertinggi?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.methodDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="methodName" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        background: "rgba(9, 9, 11, 0.9)", 
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "12px",
                        fontSize: "12px"
                      }}
                    />
                    <Bar dataKey="winRate" fill="#a78bfa" radius={[8, 8, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4 flex flex-col justify-center">
                {stats.methodDistribution.map((m) => (
                  <div key={m.methodName} className="p-4 rounded-xl bg-zinc-950/40 border border-white/5 space-y-1">
                    <span className="text-xs font-bold text-white truncate block">{m.methodName}</span>
                    <div className="flex justify-between items-center text-xs text-zinc-500 font-semibold">
                      <span>Win Rate: <span className="text-emerald-400">{m.winRate.toFixed(1)}%</span></span>
                      <span>{m.count} Trades</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "timeframe" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-base font-bold text-white">Win Rate Berdasarkan Timeframe Analisis</h3>
              <p className="text-xs text-zinc-500">Timeframe berapa yang menghasilkan setup konfirmasi paling presisi?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeframeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="timeframe" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        background: "rgba(9, 9, 11, 0.9)", 
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "12px",
                        fontSize: "12px"
                      }}
                    />
                    <Bar dataKey="winRate" fill="#22d3ee" radius={[8, 8, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4 flex flex-col justify-center">
                {timeframeData.map((tf) => (
                  <div key={tf.timeframe} className="p-4 rounded-xl bg-zinc-950/40 border border-white/5 space-y-1">
                    <span className="text-xs font-bold text-white block">Timeframe {tf.timeframe}</span>
                    <div className="flex justify-between items-center text-xs text-zinc-500 font-semibold">
                      <span>Win Rate: <span className="text-emerald-400">{tf.winRate}%</span></span>
                      <span>{tf.tradesCount} Trades</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "sesi" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-base font-bold text-white">Win Rate Berdasarkan Sesi Waktu Trading</h3>
              <p className="text-xs text-zinc-500">Optimalitas volume transaksi di sesi tertentu.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sessionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="session" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        background: "rgba(9, 9, 11, 0.9)", 
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "12px",
                        fontSize: "12px"
                      }}
                    />
                    <Bar dataKey="winRate" fill="#fb7185" radius={[8, 8, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4 flex flex-col justify-center">
                {sessionData.map((ses) => (
                  <div key={ses.session} className="p-4 rounded-xl bg-zinc-950/40 border border-white/5 space-y-1">
                    <span className="text-xs font-bold text-white block">Sesi {ses.session}</span>
                    <div className="flex justify-between items-center text-xs text-zinc-500 font-semibold">
                      <span>Win Rate: <span className="text-emerald-400">{ses.winRate}%</span></span>
                      <span>{ses.tradesCount} Trades</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "distribusi_r" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-base font-bold text-white">Histrogram Distribusi PnL R-Value</h3>
              <p className="text-xs text-zinc-500">Menganalisis persebaran rasio R-Value dari seluruh transaksi untuk mengukur konsistensi.</p>
            </div>

            <div className="h-[280px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="bucket" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      background: "rgba(9, 9, 11, 0.9)", 
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "12px",
                      fontSize: "12px"
                    }}
                  />
                  <Bar dataKey="count" fill="#818cf8" radius={[8, 8, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
