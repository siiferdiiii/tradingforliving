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
import { 
  getDashboardStats,
  getEquityCurveData,
  getConceptBreakdown,
  getConceptTimeframeBreakdown,
  getTimeframeBreakdown,
  getSessionBreakdown,
  getRDistribution
} from "@/lib/actions/analytics";
import type { 
  DashboardStats,
  EquityPoint,
  ConceptStat,
  ConceptTimeframeStat,
  TimeframeStat,
  SessionBreakdownStat
} from "@/lib/actions/analytics";
import { 
  TrendingUp, 
  Target, 
  Award, 
  Compass, 
  BarChart3,
  Calendar,
  Clock,
  Flame,
  TrendingDown,
  Sparkles,
  Layers
} from "lucide-react";
import Link from "next/link";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [equityData, setEquityData] = useState<EquityPoint[]>([]);
  const [conceptData, setConceptData] = useState<ConceptStat[]>([]);
  const [conceptTimeframeData, setConceptTimeframeData] = useState<ConceptTimeframeStat[]>([]);
  const [timeframeData, setTimeframeData] = useState<TimeframeStat[]>([]);
  const [sessionData, setSessionData] = useState<SessionBreakdownStat[]>([]);
  const [rDistributionData, setRDistributionData] = useState<{ bucket: string; count: number }[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "konsep" | "timeframe" | "sesi" | "distribusi_r">("overview");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    async function loadData() {
      try {
        const [
          dashboardStats,
          equity,
          concepts,
          conceptTimeframe,
          timeframe,
          session,
          rDist
        ] = await Promise.all([
          getDashboardStats(),
          getEquityCurveData(),
          getConceptBreakdown(),
          getConceptTimeframeBreakdown(),
          getTimeframeBreakdown(),
          getSessionBreakdown(),
          getRDistribution()
        ]);

        setStats(dashboardStats);
        setEquityData(equity);
        setConceptData(concepts);
        setConceptTimeframeData(conceptTimeframe);
        setTimeframeData(timeframe);
        setSessionData(session);

        // Process R distribution
        const bins = [
          { name: "Loss (<0R)", min: -999, max: -0.01 },
          { name: "Breakeven (0R)", min: 0, max: 0 },
          { name: "Small Win (0-1R)", min: 0.01, max: 1 },
          { name: "Med Win (1-3R)", min: 1.01, max: 3 },
          { name: "Big Win (>3R)", min: 3.01, max: 999 }
        ];
        
        const counts = bins.map(bin => {
          const count = rDist.filter(val => val >= bin.min && val <= bin.max).length;
          return {
            bucket: bin.name,
            count
          };
        });
        setRDistributionData(counts);

      } catch (error) {
        console.error("Failed to load analytics:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

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

  if (!stats || stats.totalTrades === 0) {
    return (
      <div className="space-y-6 max-w-md mx-auto text-center py-16 animate-fade-up">
        <div className="glass rounded-3xl border border-white/5 p-8 space-y-6 bg-zinc-950/20 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
            <BarChart3 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white">Belum Ada Data Analisis</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Kami memerlukan data log transaksi sebelum bisa memproses kalkulasi dan menyajikan kurva performa serta probabilitas setup Anda.
            </p>
          </div>
          <div className="pt-2">
            <Link 
              href="/sessions"
              className="text-xs font-semibold inline-block px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md duration-200"
            >
              Buat Sesi Backtest & Log Trade
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
          { id: "konsep", label: "Metode & Konsep", icon: Compass },
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
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Avg R Per Trade</span>
            <span className="text-xl font-bold text-white">+{stats.avgR.toFixed(2)} R</span>
          </div>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="glass rounded-2xl border border-white/5 p-6 min-h-[400px] flex flex-col justify-between relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        {activeTab === "overview" && (
          <div className="space-y-8 animate-fade-in">
            {/* Streaks and Strengths Panel */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-zinc-950/40 border border-white/5 flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] text-zinc-500 block uppercase font-bold">Win Streak Terbanyak</span>
                  <span className="text-sm font-extrabold text-white">{stats.maxWinStreak} beruntun</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950/40 border border-white/5 flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] text-zinc-500 block uppercase font-bold">Loss Streak Terbanyak</span>
                  <span className="text-sm font-extrabold text-white">{stats.maxLossStreak} beruntun</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950/40 border border-white/5 flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] text-zinc-500 block uppercase font-bold">Profit Factor</span>
                  <span className="text-sm font-extrabold text-white">{stats.profitFactor}x</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950/40 border border-white/5 flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] text-zinc-500 block uppercase font-bold">Strategi Terbaik</span>
                  <span className="text-sm font-extrabold text-white truncate block max-w-[150px]" title={stats.bestStrategy?.name || "-"}>
                    {stats.bestStrategy ? `${stats.bestStrategy.name} (${stats.bestStrategy.winRate}% WR)` : "-"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="text-base font-bold text-white">Akumulasi Kurva Keuntungan Sesi</h3>
                <p className="text-xs text-zinc-500">Menganalisis momentum penumpukan hasil modal kumulatif.</p>
              </div>

              {equityData.length === 0 ? (
                <div className="h-[200px] flex items-center justify-center text-zinc-500 text-xs">
                  Tidak ada data kurva akumulasi.
                </div>
              ) : (
                <div className="h-[300px] w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={equityData}>
                      <defs>
                        <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#818cf8" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis dataKey="date" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} unit="R" />
                      <Tooltip 
                        contentStyle={{ 
                          background: "rgba(9, 9, 11, 0.9)", 
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: "12px",
                          fontSize: "12px",
                          color: "#fff"
                        }}
                        formatter={(value) => [`${value} R`, "Kumulatif R"]}
                      />
                      <Area type="monotone" dataKey="cumulativeR" stroke="#818cf8" strokeWidth={2.5} fillOpacity={1} fill="url(#glow)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "konsep" && (
          <div className="space-y-8 animate-fade-in">
            {/* Probability Breakdown by Concept */}
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Win Rate Berdasarkan Konsep Setup</h3>
                <p className="text-xs text-zinc-500">Melihat akurasi winrate dan akumulasi R dari setiap konsep teknikal yang sering Anda tandai.</p>
              </div>

              {conceptData.length === 0 ? (
                <div className="h-[150px] flex items-center justify-center border border-dashed border-zinc-800 rounded-xl text-zinc-500 text-xs">
                  Tidak ada data konsep setup yang terdaftar di dalam trade Anda.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={conceptData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                        <XAxis dataKey="conceptName" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} unit="%" />
                        <Tooltip 
                          contentStyle={{ 
                            background: "rgba(9, 9, 11, 0.9)", 
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: "12px",
                            fontSize: "12px",
                            color: "#fff"
                          }}
                          formatter={(value) => [`${value}%`, "Win Rate"]}
                        />
                        <Bar dataKey="winRate" fill="#a78bfa" radius={[8, 8, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-3 flex flex-col justify-center max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                    {conceptData.map((c) => (
                      <div key={c.conceptId} className="p-4 rounded-xl bg-zinc-950/40 border border-white/5 space-y-1">
                        <span className="text-xs font-bold text-white truncate block">{c.conceptName}</span>
                        <div className="flex justify-between items-center text-[10px] text-zinc-500 font-semibold">
                          <span>Win Rate: <span className="text-emerald-400 font-bold">{c.winRate}%</span></span>
                          <span>Avg R: <span className="text-indigo-400 font-bold">+{c.avgR}R</span></span>
                          <span>{c.totalTrades} Trades</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Matrix Concept x Timeframe Trigger */}
            <div className="space-y-4 pt-6 border-t border-zinc-900/60">
              <div>
                <h3 className="text-base font-bold text-white">🎯 Matrix Probabilitas Setup Berdasarkan Timeframe</h3>
                <p className="text-xs text-zinc-500">
                  Breakdown detail probabilitas dari setiap konsep metode trading yang Anda gunakan pada masing-masing timeframe trigger.
                </p>
              </div>

              {conceptTimeframeData.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-zinc-850 rounded-2xl text-zinc-500 text-xs">
                  Belum memiliki data kombinasi konsep & timeframe. Tambahkan minimal 1 trade dengan konsep strategis tercentang.
                </div>
              ) : (
                <div className="glass rounded-xl border border-white/5 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-900 text-zinc-400 bg-zinc-950/40">
                          <th className="px-5 py-3.5 font-bold">Nama Konsep</th>
                          <th className="px-5 py-3.5 font-bold">Timeframe Trigger</th>
                          <th className="px-5 py-3.5 font-bold text-center">Total Trade</th>
                          <th className="px-5 py-3.5 font-bold text-center">Win Rate</th>
                          <th className="px-5 py-3.5 font-bold text-center">Avg R-value</th>
                          <th className="px-5 py-3.5 font-bold text-right">Efisiensi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900/40">
                        {conceptTimeframeData
                          .sort((a, b) => b.winRate - a.winRate)
                          .map((row, idx) => {
                            const isEfficient = row.winRate >= 60 && row.avgR > 1;
                            return (
                              <tr key={`${row.conceptName}-${row.timeframe}`} className="hover:bg-white/[0.01] transition-all">
                                <td className="px-5 py-3 font-semibold text-white">{row.conceptName}</td>
                                <td className="px-5 py-3">
                                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono font-medium">
                                    {row.timeframe}
                                  </span>
                                </td>
                                <td className="px-5 py-3 text-center font-mono text-zinc-400">{row.totalTrades}</td>
                                <td className="px-5 py-3 text-center font-mono text-emerald-400 font-bold">{row.winRate.toFixed(1)}%</td>
                                <td className="px-5 py-3 text-center font-mono text-indigo-400 font-semibold">+{row.avgR.toFixed(2)} R</td>
                                <td className="px-5 py-3 text-right">
                                  {isEfficient ? (
                                    <span className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">
                                      High Probability
                                    </span>
                                  ) : row.winRate < 45 ? (
                                    <span className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold uppercase">
                                      Needs Review
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-bold uppercase">
                                      Moderate
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "timeframe" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-base font-bold text-white">Win Rate Berdasarkan Timeframe Analisis</h3>
              <p className="text-xs text-zinc-500">Timeframe berapa yang menghasilkan setup konfirmasi paling presisi?</p>
            </div>

            {timeframeData.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-zinc-500 text-xs">
                Tidak ada data timeframe trigger.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={timeframeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis dataKey="timeframe" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} unit="%" />
                      <Tooltip 
                        contentStyle={{ 
                          background: "rgba(9, 9, 11, 0.9)", 
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: "12px",
                          fontSize: "12px",
                          color: "#fff"
                        }}
                        formatter={(value) => [`${value}%`, "Win Rate"]}
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
                        <span>Win Rate: <span className="text-emerald-400 font-bold">{tf.winRate}%</span></span>
                        <span>Avg R: <span className="text-indigo-400">+{tf.avgR}R</span></span>
                        <span>{tf.totalTrades} Trades</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "sesi" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-base font-bold text-white">Win Rate Berdasarkan Sesi Waktu Trading</h3>
              <p className="text-xs text-zinc-500">Optimalitas volume transaksi di sesi tertentu.</p>
            </div>

            {sessionData.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-zinc-500 text-xs">
                Tidak ada data sesi waktu trading.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sessionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis dataKey="session" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} unit="%" />
                      <Tooltip 
                        contentStyle={{ 
                          background: "rgba(9, 9, 11, 0.9)", 
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: "12px",
                          fontSize: "12px",
                          color: "#fff"
                        }}
                        formatter={(value) => [`${value}%`, "Win Rate"]}
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
                        <span>Win Rate: <span className="text-emerald-400 font-bold">{ses.winRate}%</span></span>
                        <span>Avg R: <span className="text-indigo-400">+{ses.avgR}R</span></span>
                        <span>{ses.totalTrades} Trades</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "distribusi_r" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-base font-bold text-white">Histogram Distribusi PnL R-Value</h3>
              <p className="text-xs text-zinc-500">Menganalisis persebaran rasio R-Value dari seluruh transaksi untuk mengukur konsistensi.</p>
            </div>

            {rDistributionData.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-zinc-500 text-xs">
                Tidak ada data distribusi R.
              </div>
            ) : (
              <div className="h-[280px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="bucket" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        background: "rgba(9, 9, 11, 0.9)", 
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "12px",
                        fontSize: "12px",
                        color: "#fff"
                      }}
                    />
                    <Bar dataKey="count" fill="#818cf8" radius={[8, 8, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
