"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  Target, 
  Calculator, 
  Trophy, 
  ArrowUpRight, 
  Plus, 
  Clock,
  Layers,
  ArrowRight
} from "lucide-react";
import { DatabaseManager } from "@/lib/mock-data";
import { DashboardStats, Trade, Method } from "@/types";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [methods, setMethods] = useState<Method[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setStats(DatabaseManager.getStats());
    
    const allTrades = DatabaseManager.getTrades();
    // Get last 5 trades sorted by date descending
    const sorted = [...allTrades].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setRecentTrades(sorted.slice(0, 5));
    
    setMethods(DatabaseManager.getMethods());
  }, []);

  if (!isClient || !stats) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const bestMethod = stats.methodDistribution.length > 0 ? stats.methodDistribution[0] : null;

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
            Ringkasan Performa
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Pantau dan analisis hasil backtest strategi Anda secara real-time.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/sessions/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent-violet hover:from-primary-hover hover:to-primary text-white text-sm font-medium transition-all shadow-lg shadow-primary/10"
          >
            <Plus className="w-4 h-4" />
            Sesi Baru
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Total Trades */}
        <div className="glass rounded-2xl p-6 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400 font-medium">Total Trades</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold tracking-tight text-white">{stats.totalTrades}</h3>
            <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Dari semua sesi backtest
            </p>
          </div>
        </div>

        {/* Card 2: Win Rate */}
        <div className="glass rounded-2xl p-6 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400 font-medium">Win Rate</span>
            <div className={`p-2 rounded-lg ${stats.winRate >= 50 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
              <Target className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold tracking-tight text-white">{stats.winRate}%</h3>
            <p className="text-xs text-zinc-500 mt-1">
              Konsistensi akurasi setup
            </p>
          </div>
        </div>

        {/* Card 3: Rata-Rata R */}
        <div className="glass rounded-2xl p-6 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-colors" />
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400 font-medium">Rata-Rata R Ratio</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Calculator className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold tracking-tight text-white">
              {stats.avgR >= 0 ? "+" : ""}{stats.avgR} R
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Rata-rata risk-to-reward tercapai
            </p>
          </div>
        </div>

        {/* Card 4: Best Strategy */}
        <div className="glass rounded-2xl p-6 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl group-hover:bg-violet-500/10 transition-colors" />
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400 font-medium">Metode Terbaik</span>
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <Trophy className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-bold tracking-tight text-white truncate">
              {bestMethod ? bestMethod.methodName : "N/A"}
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              {bestMethod ? `Win Rate: ${bestMethod.winRate.toFixed(1)}%` : "Belum ada data"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equity Curve (2/3 width on desktop) */}
        <div className="lg:col-span-2 glass rounded-2xl border border-white/5 p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Kurva Ekuitas (Saldo Sesi)</h3>
              <p className="text-xs text-zinc-500">Perkembangan saldo kumulatif sepanjang trade backtest</p>
            </div>
            <Link 
              href="/analytics" 
              className="flex items-center gap-1.5 text-xs text-primary hover:text-primary-hover font-semibold transition-colors"
            >
              Detail Analitik
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.equityCurve}>
                <defs>
                  <linearGradient id="equityGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#52525b" 
                  fontSize={11} 
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#52525b" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: "rgba(9, 9, 11, 0.9)", 
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "#f4f4f5"
                  }}
                  formatter={(value: any) => [`$${value}`, "Saldo"]}
                />
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#818cf8" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#equityGlow)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Method Breakdown & Quick Actions (1/3 width on desktop) */}
        <div className="glass rounded-2xl border border-white/5 p-6 flex flex-col">
          <div className="mb-6">
            <h3 className="text-base font-bold text-white">Distribusi Metode</h3>
            <p className="text-xs text-zinc-500">Persentase & jumlah trade per metode teknikal</p>
          </div>

          <div className="flex-1 space-y-4">
            {stats.methodDistribution.length > 0 ? (
              stats.methodDistribution.map((m, idx) => {
                const colors = ["bg-indigo-500", "bg-cyan-500", "bg-violet-500", "bg-emerald-500"];
                const color = colors[idx % colors.length];
                return (
                  <div key={m.methodName} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-zinc-300 truncate max-w-[150px]">
                        {m.methodName}
                      </span>
                      <span className="text-zinc-500">
                        {m.count} trades ({m.winRate.toFixed(1)}% WR)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${color} rounded-full`}
                        style={{ width: `${(m.count / stats.totalTrades) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <Layers className="w-8 h-8 text-zinc-600 mb-2" />
                <p className="text-xs text-zinc-500">Belum ada metode trading yang terdaftar.</p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-900">
            <Link
              href="/methods/new"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-all"
            >
              Kelola Metode Teknikal
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Trades Section */}
      <div className="glass rounded-2xl border border-white/5 p-6 relative overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-base font-bold text-white">Trade Terbaru</h3>
            <p className="text-xs text-zinc-500">5 transaksi yang baru saja dicatat</p>
          </div>
          <Link 
            href="/sessions" 
            className="flex items-center gap-1.5 text-xs text-primary hover:text-primary-hover font-semibold transition-colors"
          >
            Lihat Semua Sesi
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentTrades.length > 0 ? (
          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-900 text-xs font-semibold text-zinc-400 bg-zinc-950/20">
                  <th className="px-6 py-4">Tanggal</th>
                  <th className="px-6 py-4">Instrumen</th>
                  <th className="px-6 py-4">Metode</th>
                  <th className="px-6 py-4">Strategi</th>
                  <th className="px-6 py-4">Arah</th>
                  <th className="px-6 py-4">Hasil</th>
                  <th className="px-6 py-4 text-right">PnL R</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {recentTrades.map((trade) => (
                  <tr key={trade.id} className="text-sm text-zinc-300 hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-3.5 text-xs text-zinc-500 font-mono">
                      {new Date(trade.createdAt).toLocaleDateString("id-ID", { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-3.5 font-bold text-white">{trade.pair}</td>
                    <td className="px-6 py-3.5 text-xs text-zinc-400 truncate max-w-[150px]">{trade.methodName}</td>
                    <td className="px-6 py-3.5 text-xs text-zinc-400 truncate max-w-[150px]">{trade.strategyName}</td>
                    <td className="px-6 py-3.5">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${trade.type === 'long' ? "bg-indigo-500/10 text-indigo-400" : "bg-cyan-500/10 text-cyan-400"}`}>
                        {trade.type === 'long' ? 'BUY' : 'SELL'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                        trade.result === 'win' 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                          : trade.result === 'loss' 
                          ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                          : "bg-zinc-800/40 text-zinc-400 border border-zinc-700/30"
                      }`}>
                        {trade.result.toUpperCase()}
                      </span>
                    </td>
                    <td className={`px-6 py-3.5 text-right font-semibold font-mono ${
                      trade.pnl > 0 
                        ? "text-emerald-400" 
                        : trade.pnl < 0 
                        ? "text-red-400" 
                        : "text-zinc-500"
                    }`}>
                      {trade.pnl > 0 ? "+" : ""}{trade.pnl}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Layers className="w-12 h-12 text-zinc-700 mb-3" />
            <h4 className="text-zinc-300 font-bold">Belum ada trade dicatat</h4>
            <p className="text-xs text-zinc-500 mt-1 max-w-[280px]">Mulai dengan membuat metode, sesi backtest, lalu catat trade pertama Anda.</p>
            <Link
              href="/sessions/new"
              className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold transition-all hover:bg-primary-hover"
            >
              Mulai Sesi Backtest
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
