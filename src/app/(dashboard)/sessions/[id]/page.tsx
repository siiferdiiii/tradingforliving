"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Compass,
  AlertTriangle,
  Smile,
  Image as ImageIcon
} from "lucide-react";
import { DatabaseManager } from "@/lib/mock-data";
import { TradingSession, Trade, Method, Strategy } from "@/types";

export default function SessionDetailPage() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<TradingSession | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [method, setMethod] = useState<Method | null>(null);
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  
  const [isClient, setIsClient] = useState(false);
  const [expandedTradeId, setExpandedTradeId] = useState<string | null>(null);
  const [isGridView, setIsGridView] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const segments = pathname.split("/");
    const sessionId = segments[segments.length - 1];

    if (sessionId) {
      const allSessions = DatabaseManager.getSessions();
      const foundSession = allSessions.find(s => s.id === sessionId);
      if (foundSession) {
        setSession(foundSession);

        // Load associated trades
        const allTrades = DatabaseManager.getTrades();
        const assocTrades = allTrades.filter(t => t.sessionId === sessionId);
        setTrades(assocTrades);

        // Load method & strategy details if available
        if (assocTrades.length > 0) {
          const mId = assocTrades[0].methodId;
          const sId = assocTrades[0].strategyId;
          
          const foundMethod = DatabaseManager.getMethods().find(m => m.id === mId);
          if (foundMethod) setMethod(foundMethod);
          
          const foundStrat = DatabaseManager.getStrategies().find(s => s.id === sId);
          if (foundStrat) setStrategy(foundStrat);
        }
      }
    }
  }, [pathname]);

  const handleDelete = () => {
    if (!session) return;
    if (confirm("Apakah Anda yakin ingin menghapus sesi backtest ini beserta seluruh tradenya?")) {
      const allSessions = DatabaseManager.getSessions();
      const updated = allSessions.filter(s => s.id !== session.id);
      DatabaseManager.saveSessions(updated);

      // Clean up trades in session
      const allTrades = DatabaseManager.getTrades();
      const filteredTrades = allTrades.filter(t => t.sessionId !== session.id);
      DatabaseManager.saveTrades(filteredTrades);

      router.push("/sessions");
    }
  };

  const handleComplete = () => {
    if (!session) return;
    if (confirm("Tandai sesi backtest ini sebagai Selesai?")) {
      const allSessions = DatabaseManager.getSessions();
      const updated = allSessions.map(s => {
        if (s.id === session.id) {
          return { ...s, status: "completed" as const };
        }
        return s;
      });
      DatabaseManager.saveSessions(updated);
      setSession({ ...session, status: "completed" });
    }
  };

  const handleTradeDelete = (tradeId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Hapus catatan trade ini?")) {
      const allTrades = DatabaseManager.getTrades();
      const updatedTrades = allTrades.filter(t => t.id !== tradeId);
      DatabaseManager.saveTrades(updatedTrades);
      
      const assoc = updatedTrades.filter(t => t.sessionId === session!.id);
      setTrades(assoc);

      // Recalculate session stats
      const wins = assoc.filter(t => t.result === "win");
      const wr = assoc.length > 0 ? (wins.length / assoc.length) * 100 : 0;
      const profit = assoc.reduce((sum, t) => sum + t.pnl, 0);

      const allSessions = DatabaseManager.getSessions();
      const updatedSessions = allSessions.map(s => {
        if (s.id === session!.id) {
          return { 
            ...s, 
            totalTrades: assoc.length, 
            winRate: parseFloat(wr.toFixed(1)),
            netProfit: profit,
            endBalance: s.startBalance + profit
          };
        }
        return s;
      });
      DatabaseManager.saveSessions(updatedSessions);
      setSession({
        ...session!,
        totalTrades: assoc.length,
        winRate: parseFloat(wr.toFixed(1)),
        netProfit: profit,
        endBalance: session!.startBalance + profit
      });
    }
  };

  const toggleExpandTrade = (id: string) => {
    if (expandedTradeId === id) {
      setExpandedTradeId(null);
    } else {
      setExpandedTradeId(id);
    }
  };

  if (!isClient) {
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
  const totalTrades = trades.length;
  const wins = trades.filter(t => t.result === "win");
  const winRate = totalTrades > 0 ? ((wins.length / totalTrades) * 100).toFixed(1) : "0.0";
  const avgR = totalTrades > 0 ? (trades.reduce((sum, t) => sum + t.rr, 0) / totalTrades).toFixed(2) : "0.00";
  
  // Find best trade (highest R value)
  let bestTradeR = 0;
  trades.forEach(t => {
    if (t.result === "win" && t.rr > bestTradeR) {
      bestTradeR = t.rr;
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
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
              session.status === "active" 
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                : "bg-zinc-800/40 text-zinc-400 border border-zinc-700/30"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${session.status === "active" ? "bg-emerald-400 animate-pulse" : "bg-zinc-500"}`} />
              {session.status === "active" ? "Sesi Aktif" : "Sesi Selesai"}
            </span>

            {method && strategy && (
              <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">
                {method.name} &rarr; {strategy.name}
              </span>
            )}
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white">{session.name}</h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 font-medium">
            <span className="font-bold text-zinc-200">Pair: {session.notes.split(" ")[2] || "Forex"}</span>
            <span className="text-zinc-500">|</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Periode: {new Date(session.date).toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
            </span>
          </div>
        </div>

        <div className="flex gap-2.5 self-start md:self-center">
          {session.status === "active" && (
            <button
              onClick={handleComplete}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-emerald-500/20 hover:border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 text-xs font-bold transition-all"
            >
              <Check className="w-4 h-4" />
              Selesaikan Sesi
            </button>
          )}

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

          {session.status === "active" && (
            <Link
              href={`/sessions/${session.id}/trades/new`}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent-violet hover:from-primary-hover hover:to-primary text-white text-xs font-semibold shadow-lg shadow-primary/10 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              Catat Trade Baru
            </Link>
          )}
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
                    return (
                      <React.Fragment key={trade.id}>
                        <tr 
                          className="text-sm text-zinc-300 hover:bg-white/[0.01] transition-colors cursor-pointer"
                          onClick={() => toggleExpandTrade(trade.id)}
                        >
                          <td className="px-6 py-4 flex items-center gap-2">
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                            <span className="font-mono text-xs text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                              {trade.pair} ({trade.notes?.split(" ").includes("London") ? "LONDON" : "NY"})
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono">{trade.entryPrice.toFixed(5)}</td>
                          <td className="px-6 py-4 font-mono text-red-500">{trade.stopLoss?.toFixed(5) || "-"}</td>
                          <td className="px-6 py-4 font-mono text-emerald-500">{trade.takeProfit?.toFixed(5) || "-"}</td>
                          <td className="px-6 py-4 font-mono">{trade.rr.toFixed(2)} R</td>
                          <td className="px-6 py-4">
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              trade.result === 'win' 
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                : trade.result === 'loss' 
                                ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                                : "bg-zinc-800/40 text-zinc-400 border border-zinc-700/30"
                            }`}>
                              {trade.result.toUpperCase()}
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
                                      <span className={`text-base font-bold font-mono ${trade.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                        {trade.pnl >= 0 ? "+" : ""}${trade.pnl} ({(trade.pnl / 100).toFixed(2)}% dari modal)
                                      </span>
                                    </div>

                                    <div className="space-y-1">
                                      <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block">Kondisi Psikologis</span>
                                      <span className="text-xs font-semibold bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-xl flex items-center gap-1">
                                        <Smile className="w-3.5 h-3.5 text-indigo-400" />
                                        Disiplin
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block flex items-center gap-1">
                                    <ImageIcon className="w-3.5 h-3.5" />
                                    Screenshot Grafik Pendukung
                                  </span>
                                  {trade.entryImage ? (
                                    <div className="relative rounded-xl overflow-hidden border border-white/5 group h-40">
                                      <img
                                        src={trade.entryImage}
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
            {session.status === "active" && (
              <Link
                href={`/sessions/${session.id}/trades/new`}
                className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold transition-all hover:bg-primary-hover"
              >
                Catat Trade Pertama
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
