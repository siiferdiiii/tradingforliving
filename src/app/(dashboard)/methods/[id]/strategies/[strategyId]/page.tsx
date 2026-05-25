"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Trash2, 
  Check, 
  Clock, 
  Layers, 
  Target, 
  Shield, 
  FileText, 
  BarChart3,
  ListTodo
} from "lucide-react";
import { DatabaseManager } from "@/lib/mock-data";
import { Strategy, Method, Trade } from "@/types";

export default function StrategyDetailPage() {
  const pathname = usePathname();
  const router = useRouter();
  const [method, setMethod] = useState<Method | null>(null);
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const segments = pathname.split("/");
    const stratId = segments[segments.length - 1];
    const methodId = segments[segments.indexOf("methods") + 1];

    if (methodId && stratId) {
      const allMethods = DatabaseManager.getMethods();
      const foundMethod = allMethods.find(m => m.id === methodId);
      if (foundMethod) {
        setMethod(foundMethod);
      }

      const allStrats = DatabaseManager.getStrategies();
      const foundStrat = allStrats.find(s => s.id === stratId);
      if (foundStrat) {
        setStrategy(foundStrat);
      }

      // Load trades for this strategy
      const allTrades = DatabaseManager.getTrades();
      const assocTrades = allTrades.filter(t => t.strategyId === stratId);
      setTrades(assocTrades);
    }
  }, [pathname]);

  const handleDelete = () => {
    if (!strategy || !method) return;
    if (confirm("Apakah Anda yakin ingin menghapus strategi ini?")) {
      const allStrats = DatabaseManager.getStrategies();
      const updated = allStrats.filter(s => s.id !== strategy.id);
      DatabaseManager.saveStrategies(updated);

      // Decrement count in method
      const allMethods = DatabaseManager.getMethods();
      const updatedMethods = allMethods.map(m => {
        if (m.id === method.id) {
          return { ...m, strategiesCount: Math.max(0, m.strategiesCount - 1) };
        }
        return m;
      });
      DatabaseManager.saveMethods(updatedMethods);

      router.push(`/methods/${method.id}`);
    }
  };

  if (!isClient) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!method || !strategy) {
    return (
      <div className="text-center py-16 space-y-4">
        <h3 className="text-lg font-bold text-white">Strategi tidak ditemukan</h3>
        <Link href="/methods" className="text-primary hover:underline text-xs font-semibold">
          Kembali ke Daftar Metode
        </Link>
      </div>
    );
  }

  // Calculate strategy specific performance metrics based on mock trades
  const totalStrategyTrades = trades.length;
  const wins = trades.filter(t => t.result === "win");
  const winRate = totalStrategyTrades > 0 ? ((wins.length / totalStrategyTrades) * 100).toFixed(1) : "0.0";
  const avgR = totalStrategyTrades > 0 ? (trades.reduce((sum, t) => sum + t.rr, 0) / totalStrategyTrades).toFixed(2) : "0.00";

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Back Button */}
      <Link
        href={`/methods/${method.id}`}
        className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Metode {method.name}
      </Link>

      {/* Header Panel */}
      <div className="glass rounded-2xl border border-white/5 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Decorative corner */}
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />

        <div className="space-y-3 flex-grow">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-950 border border-zinc-900 text-indigo-400 font-mono">
              STRATEGI TURUNAN
            </span>
            <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Dibuat: {new Date(strategy.createdAt).toLocaleDateString("id-ID", { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white">{strategy.name}</h1>
          <p className="text-xs text-zinc-400 max-w-xl">
            Model konfirmasi di bawah metode teknikal: <span className="text-primary font-semibold">{method.name}</span>
          </p>
        </div>

        <div className="flex gap-3 self-start md:self-center">
          <button
            onClick={handleDelete}
            className="flex items-center justify-center p-3 rounded-xl border border-white/5 hover:border-red-500/20 bg-white/5 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-all"
            title="Hapus Strategi"
          >
            <Trash2 className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass rounded-2xl border border-white/5 p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Total Trades</span>
            <span className="text-xl font-bold text-white">{totalStrategyTrades}</span>
          </div>
        </div>

        <div className="glass rounded-2xl border border-white/5 p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Win Rate</span>
            <span className="text-xl font-bold text-white">{winRate}%</span>
          </div>
        </div>

        <div className="glass rounded-2xl border border-white/5 p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Rata-Rata R</span>
            <span className="text-xl font-bold text-white">+{avgR} R</span>
          </div>
        </div>
      </div>

      {/* Core Strategy Specs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Entry Rules Column (2/3 width) */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass rounded-2xl border border-white/5 p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              Aturan Pemicu Setup (Entry Trigger)
            </h3>
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line bg-zinc-950/40 p-4 rounded-xl border border-white/5">
              {strategy.description || "Belum ada deskripsi aturan pemicu entri."}
            </p>
          </div>

          {/* SL & TP Guidelines */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="glass rounded-2xl border border-white/5 p-6 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-red-400" />
                Manajemen Resiko (SL)
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed bg-zinc-950/40 p-3.5 rounded-xl border border-white/5 min-h-[80px]">
                SL ditempatkan secara terukur berdasarkan level teknikal valid (seperti di bawah/di atas swing point pemicu).
              </p>
            </div>

            <div className="glass rounded-2xl border border-white/5 p-6 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                Target Keuntungan (TP)
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed bg-zinc-950/40 p-3.5 rounded-xl border border-white/5 min-h-[80px]">
                Target TP disesuaikan dengan key liquidity pools terdekat untuk memastikan R:R minimum 1:2 terpenuhi.
              </p>
            </div>
          </div>
        </div>

        {/* Right Info Column (1/3 width) */}
        <div className="space-y-6">
          <div className="glass rounded-2xl border border-white/5 p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-cyan-400" />
              Kriteria Konsep
            </h3>
            <p className="text-xs text-zinc-500">Konsep teknikal wajib terkonfirmasi di chart.</p>
            
            <div className="flex flex-wrap gap-2 pt-2">
              {strategy.rules && strategy.rules.length > 0 ? (
                strategy.rules.map((rule, idx) => (
                  <span 
                    key={idx} 
                    className="text-xs font-semibold px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 shadow-sm"
                  >
                    {rule}
                  </span>
                ))
              ) : (
                <span className="text-xs text-zinc-500 italic">Belum ada konsep.</span>
              )}
            </div>
          </div>

          <div className="glass rounded-2xl border border-white/5 p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Sesi Trading Relevan</h3>
            <p className="text-xs text-zinc-500">Strategi ini dioptimalkan pada zona volume tinggi.</p>
            <div className="flex flex-wrap gap-2 pt-1.5">
              {["LONDON", "NEW_YORK"].map((sess) => (
                <span 
                  key={sess} 
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                >
                  {sess}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
