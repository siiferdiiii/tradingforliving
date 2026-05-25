"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Calendar, 
  Target, 
  Award, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  FileText,
  Clock,
  Smile,
  Image as ImageIcon
} from "lucide-react";
import { getSessionById, deleteSession } from "@/lib/actions/session";
import { deleteTrade } from "@/lib/actions/trade";

type SessionWithRelations = Awaited<ReturnType<typeof getSessionById>>;

export default function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = use(params);
  const router = useRouter();
  const [session, setSession] = useState<SessionWithRelations>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedTradeId, setExpandedTradeId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    async function load() {
      setIsLoading(true);
      try {
        const data = await getSessionById(sessionId);
        setSession(data);
      } catch (err) {
        console.error("Gagal memuat sesi:", err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [sessionId]);

  const handleDelete = async () => {
    if (!session) return;
    if (confirm("Apakah Anda yakin ingin menghapus sesi backtest ini beserta seluruh tradenya?")) {
      const res = await deleteSession(session.id);
      if (res?.error) {
        alert(typeof res.error === "string" ? res.error : "Gagal menghapus sesi");
      } else {
        router.push("/sessions");
      }
    }
  };

  const handleTradeDelete = async (tradeId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Hapus catatan trade ini?")) {
      const res = await deleteTrade(tradeId);
      if (res?.error) {
        alert(typeof res.error === "string" ? res.error : "Gagal menghapus trade");
      } else {
        // Reload session data
        const data = await getSessionById(sessionId);
        setSession(data);
      }
    }
  };

  const toggleExpandTrade = (id: string) => {
    if (expandedTradeId === id) {
      setExpandedTradeId(null);
    } else {
      setExpandedTradeId(id);
    }
  };

  if (!isClient || isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-16 space-y-4">
        <h3 className="text-lg font-bold text-white">Sesi tidak ditemukan</h3>
        <Link href="/sessions" className="text-primary hover:underline text-xs font-semibold">
          Kembali ke Daftar Sesi
        </Link>
      </div>
    );
  }

  // Stats calculation
  const trades = session.trades || [];
  const totalTrades = trades.length;
  const wins = trades.filter(t => t.result === "WIN");
  const winRate = totalTrades > 0 ? ((wins.length / totalTrades) * 100).toFixed(1) : "0.0";
  const avgR = totalTrades > 0 ? (trades.reduce((sum, t) => sum + Number(t.actualR || 0), 0) / totalTrades).toFixed(2) : "0.00";
  
  // Find best trade (highest R value)
  let bestTradeR = 0;
  trades.forEach(t => {
    if (t.result === "WIN" && Number(t.actualR || 0) > bestTradeR) {
      bestTradeR = Number(t.actualR || 0);
    }
  });

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Back Button */}
      <Link
        href="/sessions"
        className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Daftar Sesi
      </Link>

      {/* Header Container */}
      <div className="glass rounded-2xl border border-white/5 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-3 flex-grow">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Sesi Aktif
            </span>

            {session.method && session.strategy && (
              <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">
                {session.method.name} &rarr; {session.strategy.name}
              </span>
            )}
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white">{session.name}</h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 font-medium">
            <span className="font-bold text-zinc-200">Pair: {session.instrument}</span>
            <span className="text-zinc-500">|</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Periode: {new Date(session.periodStart).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} - {new Date(session.periodEnd).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>
        </div>

        <div className="flex gap-2.5 self-start md:self-center">
          <button
            onClick={handleDelete}
            className="flex items-center justify-center p-3 rounded-xl border border-white/5 hover:border-red-500/20 bg-white/5 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-all"
            title="Hapus Sesi"
          >
            <Trash2 className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="glass rounded-2xl border border-white/5 p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Total Trades</span>
            <span className="text-xl font-bold text-white">{totalTrades}</span>
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
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Rata-Rata R</span>
            <span className="text-xl font-bold text-white">+{avgR} R</span>
          </div>
        </div>

        <div className="glass rounded-2xl border border-white/5 p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Best Trade</span>
            <span className="text-xl font-bold text-white">+{bestTradeR.toFixed(2)} R</span>
          </div>
        </div>
      </div>

      {/* Trades List Container */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Log Eksekusi Transaksi</h2>
            <p className="text-xs text-zinc-500">Log trade di sesi backtesting ini.</p>
          </div>

          <Link
            href={`/sessions/${session.id}/trades/new`}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent-violet hover:from-primary-hover hover:to-primary text-white text-xs font-semibold shadow-lg shadow-primary/10 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            Catat Trade Baru
          </Link>
        </div>

        {trades.length > 0 ? (
          <div className="glass rounded-2xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-900 text-xs font-semibold text-zinc-400 bg-zinc-950/20">
                    <th className="px-6 py-4">Sesi Waktu</th>
                    <th className="px-6 py-4">Entry Price</th>
                    <th className="px-6 py-4">Stop Loss</th>
                    <th className="px-6 py-4">Take Profit</th>
                    <th className="px-6 py-4">R:R Target</th>
                    <th className="px-6 py-4">Hasil</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/60">
                  {trades.map((trade) => {
                    const isExpanded = expandedTradeId === trade.id;
                    const screenshotUrl = trade.images?.[0]?.storageUrl;

                    return (
                      <React.Fragment key={trade.id}>
                        <tr 
                          className="text-sm text-zinc-300 hover:bg-white/[0.01] transition-colors cursor-pointer"
                          onClick={() => toggleExpandTrade(trade.id)}
                        >
                          <td className="px-6 py-4 flex items-center gap-2">
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                            <span className="font-mono text-xs text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                              {session.instrument} ({trade.session})
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono">{Number(trade.entryPrice).toFixed(5)}</td>
                          <td className="px-6 py-4 font-mono text-red-500">{Number(trade.slPrice).toFixed(5)}</td>
                          <td className="px-6 py-4 font-mono text-emerald-500">{Number(trade.tpPrice).toFixed(5)}</td>
                          <td className="px-6 py-4 font-mono">{Number(trade.rrTarget).toFixed(2)} R</td>
                          <td className="px-6 py-4">
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              trade.result === 'WIN' 
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                : trade.result === 'LOSS' 
                                ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                                : "bg-zinc-800/40 text-zinc-400 border border-zinc-700/30"
                            }`}>
                              {trade.result}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => handleTradeDelete(trade.id, e)}
                              className="p-1.5 text-zinc-600 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          </td>
                        </tr>

                        {/* Collapsible row expansion */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={7} className="px-6 py-5 bg-zinc-950/40 border-t border-zinc-900/60">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in text-zinc-300">
                                <div className="space-y-4">
                                  <div className="space-y-1.5">
                                    <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Catatan Trading</span>
                                    <p className="text-xs bg-zinc-900 border border-zinc-850 p-3.5 rounded-xl leading-relaxed">
                                      {trade.notes || "Tidak ada catatan."}
                                    </p>
                                  </div>

                                  <div className="flex gap-6">
                                    <div className="space-y-1">
                                      <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block">Hasil Finansial</span>
                                      <span className={`text-base font-bold font-mono ${Number(trade.actualR) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                        {Number(trade.actualR) >= 0 ? "+" : ""}{Number(trade.actualR).toFixed(2)} R
                                      </span>
                                    </div>

                                    <div className="space-y-1">
                                      <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block">Kondisi Psikologis</span>
                                      <span className="text-xs font-semibold bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-xl flex items-center gap-1">
                                        <Smile className="w-3.5 h-3.5 text-indigo-400" />
                                        {trade.mood || "DISCIPLINED"}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block flex items-center gap-1">
                                    <ImageIcon className="w-3.5 h-3.5" />
                                    Screenshot Grafik Pendukung
                                  </span>
                                  {screenshotUrl ? (
                                    <div className="relative rounded-xl overflow-hidden border border-white/5 group h-40">
                                      <img
                                        src={screenshotUrl}
                                        alt="Screenshot Entry"
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Grafik Posisi Entri</span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="border border-dashed border-zinc-800 rounded-xl h-40 flex flex-col items-center justify-center text-zinc-600 bg-zinc-950/20">
                                      <ImageIcon className="w-8 h-8 mb-1.5" />
                                      <span className="text-[10px] font-medium">Tidak ada screenshot diunggah.</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="glass rounded-2xl border border-white/5 flex flex-col items-center justify-center py-12 text-center">
            <FileText className="w-12 h-12 text-zinc-700 mb-3" />
            <h4 className="text-zinc-300 font-bold">Belum ada trade dicatat</h4>
            <p className="text-xs text-zinc-500 mt-1 max-w-[280px]">Mulai lakukan pengujian dengan mencatat trade pertama di sesi backtest ini.</p>
            <Link
              href={`/sessions/${session.id}/trades/new`}
              className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold transition-all hover:bg-primary-hover"
            >
              Catat Trade Pertama
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
