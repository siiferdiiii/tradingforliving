"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Plus, 
  Calendar, 
  Globe, 
  Lock, 
  TrendingUp, 
  Target, 
  Calculator, 
  FileText,
  ChevronRight,
  Trash2
} from "lucide-react";
import { getMethodById, deleteMethod } from "@/lib/actions/method";
import { deleteStrategy } from "@/lib/actions/strategy";

type DBMethodWithRelations = Awaited<ReturnType<typeof getMethodById>>;

export default function MethodDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: methodId } = use(params);
  const router = useRouter();
  const [method, setMethod] = useState<DBMethodWithRelations>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    async function load() {
      setIsLoading(true);
      try {
        const data = await getMethodById(methodId);
        setMethod(data);
      } catch (err) {
        console.error("Gagal memuat metode:", err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [methodId]);

  const handleDelete = async () => {
    if (!method) return;
    if (confirm("Apakah Anda yakin ingin menghapus metode teknikal ini? Semua strategi di dalamnya juga akan terhapus.")) {
      const res = await deleteMethod(method.id);
      if (res?.error) {
        alert(typeof res.error === "string" ? res.error : "Gagal menghapus metode");
      } else {
        router.push("/methods");
      }
    }
  };

  const handleStrategyDelete = async (stratId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Apakah Anda yakin ingin menghapus strategi ini?")) {
      const res = await deleteStrategy(stratId);
      if (res?.error) {
        alert(typeof res.error === "string" ? res.error : "Gagal menghapus strategi");
      } else {
        try {
          const data = await getMethodById(methodId);
          setMethod(data);
        } catch (err) {
          console.error("Gagal memuat ulang metode:", err);
        }
      }
    }
  };

  if (!isClient || isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!method) {
    return (
      <div className="text-center py-16 space-y-4">
        <h3 className="text-lg font-bold text-white">Metode tidak ditemukan</h3>
        <Link href="/methods" className="text-primary hover:underline text-xs font-semibold">
          Kembali ke Daftar Metode
        </Link>
      </div>
    );
  }

  // Calculate specific method stats based on trades
  const trades = method.backtestSessions?.flatMap(s => s.trades) || [];
  const totalMethodTrades = trades.length;
  const wins = trades.filter(t => t.result === "WIN" || t.result === "PARTIAL");
  const winRate = totalMethodTrades > 0 ? ((wins.length / totalMethodTrades) * 100).toFixed(1) : "0.0";
  const avgR = totalMethodTrades > 0 ? (trades.reduce((sum, t) => sum + Number(t.actualR || 0), 0) / totalMethodTrades).toFixed(2) : "0.00";

  const strategies = method.strategies || [];

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Back Button */}
      <Link
        href="/methods"
        className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Daftar Metode
      </Link>

      {/* Header Panel */}
      <div className="glass rounded-2xl border border-white/5 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Decorative corner */}
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />

        <div className="space-y-3 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
              method.isPublic 
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                : "bg-zinc-800/40 text-zinc-400 border border-zinc-700/30"
            }`}>
              {method.isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              {method.isPublic ? "Publik" : "Privat"}
            </span>
            <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Dibuat: {new Date(method.createdAt).toLocaleDateString("id-ID", { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white">{method.name}</h1>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl">
            {method.description || "Tidak ada deskripsi tentang metode teknikal ini."}
          </p>
        </div>

        <div className="flex gap-3 self-start md:self-center">
          <button
            onClick={handleDelete}
            className="flex items-center justify-center p-3 rounded-xl border border-white/5 hover:border-red-500/20 bg-white/5 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-all"
            title="Hapus Metode"
          >
            <Trash2 className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass rounded-2xl border border-white/5 p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Total Trades</span>
            <span className="text-xl font-bold text-white">{totalMethodTrades}</span>
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
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Rata-Rata R</span>
            <span className="text-xl font-bold text-white">+{avgR} R</span>
          </div>
        </div>
      </div>

      {/* Strategies List Container */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Strategi & Konsep Konfirmasi</h2>
            <p className="text-xs text-zinc-500">Turunan model entri yang digunakan di bawah metode ini.</p>
          </div>
          <Link
            href={`/methods/${method.id}/strategies/new`}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/10 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            Tambah Strategi
          </Link>
        </div>

        {strategies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {strategies.map((strat) => {
              const stratTrades = strat.backtestSessions?.flatMap(s => s.trades) || [];
              const totalStratTrades = stratTrades.length;
              const stratWins = stratTrades.filter(t => t.result === "WIN" || t.result === "PARTIAL");
              const stratWinRate = totalStratTrades > 0 ? ((stratWins.length / totalStratTrades) * 100).toFixed(1) : "0.0";

              return (
                <div 
                  key={strat.id}
                  className="glass rounded-2xl border border-white/5 p-6 flex flex-col justify-between hover:border-zinc-800 transition-all relative overflow-hidden group"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors">
                        {strat.name}
                      </h3>
                      <button
                        onClick={(e) => handleStrategyDelete(strat.id, e)}
                        className="p-1 text-zinc-600 hover:text-red-400 rounded-md hover:bg-red-500/5 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-zinc-400" />
                        Aturan Konfirmasi Entri
                      </span>
                      <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                        {strat.triggerEntry || "Tidak ada deskripsi untuk strategi ini."}
                      </p>
                    </div>

                    {/* Rules Preview Tags */}
                    {strat.concepts && strat.concepts.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {strat.concepts.map((concept) => (
                          <span 
                            key={concept.id} 
                            className="text-[9px] font-semibold px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800/80 text-zinc-400"
                          >
                            {concept.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-900/60">
                    <div className="flex gap-4 text-xs font-mono font-medium text-zinc-500">
                      <div>
                        WR: <span className="text-emerald-400">{stratWinRate}%</span>
                      </div>
                      <div>
                        Trades: <span className="text-zinc-300">{totalStratTrades}</span>
                      </div>
                    </div>
                    
                    <Link
                      href={`/methods/${method.id}/strategies/${strat.id}`}
                      className="flex items-center gap-1 text-xs text-primary hover:text-primary-hover font-semibold transition-all group/btn"
                    >
                      Detail Aturan
                      <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass rounded-2xl border border-white/5 flex flex-col items-center justify-center py-12 text-center">
            <FileText className="w-12 h-12 text-zinc-700 mb-3" />
            <h4 className="text-zinc-300 font-bold">Belum ada strategi terdaftar</h4>
            <p className="text-xs text-zinc-500 mt-1 max-w-[280px]">Tambahkan model strategi turunan (seperti Order Block Refinement, FVG Mitigation) di bawah metode ini.</p>
            <Link
              href={`/methods/${method.id}/strategies/new`}
              className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold transition-all hover:bg-primary-hover"
            >
              Buat Strategi Pertama
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
