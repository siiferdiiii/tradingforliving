"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Layers, Plus, Search, Grid, List, Globe, Lock, Trash2, Eye } from "lucide-react";
import { getMethodsByUser, deleteMethod } from "@/lib/actions/method";

type DBMethod = Awaited<ReturnType<typeof getMethodsByUser>>[number];

function getMethodStats(method: DBMethod) {
  const trades = method.backtestSessions.flatMap(s => s.trades);
  const totalTrades = trades.length;
  
  const wins = trades.filter(t => t.result === "WIN" || t.result === "PARTIAL");
  const winRate = totalTrades > 0 ? ((wins.length / totalTrades) * 100).toFixed(1) : "0.0";
  
  const totalR = trades.reduce((sum, t) => sum + Number(t.actualR || 0), 0);
  const avgR = totalTrades > 0 ? (totalR / totalTrades).toFixed(2) : "0.00";
  
  const positiveR = trades
    .filter(t => Number(t.actualR || 0) > 0)
    .reduce((sum, t) => sum + Number(t.actualR || 0), 0);
  const negativeR = Math.abs(
    trades
      .filter(t => Number(t.actualR || 0) < 0)
      .reduce((sum, t) => sum + Number(t.actualR || 0), 0)
  );
  const profitFactor = negativeR === 0 ? positiveR.toFixed(2) : (positiveR / negativeR).toFixed(2);
  
  return {
    totalTrades,
    winRate,
    avgR,
    profitFactor,
  };
}

export default function MethodsPage() {
  const [methods, setMethods] = useState<DBMethod[]>([]);
  const [isGridView, setIsGridView] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
    async function load() {
      try {
        const data = await getMethodsByUser();
        setMethods(data);
      } catch (err) {
        console.error("Gagal memuat metode:", err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Apakah Anda yakin ingin menghapus metode teknikal ini? Semua strategi di dalamnya juga akan terhapus.")) {
      const res = await deleteMethod(id);
      if (res?.error) {
        alert(typeof res.error === "string" ? res.error : "Gagal menghapus metode");
      } else {
        setMethods(methods.filter(m => m.id !== id));
      }
    }
  };

  const filteredMethods = methods.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isClient || isLoading) {
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
            Metode Teknikal
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Bangun metode trading Anda, tentukan rule, dan definisikan konsep pemicu konfirmasi setup.
          </p>
        </div>
        <Link
          href="/methods/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent-violet hover:from-primary-hover hover:to-primary text-white text-sm font-medium transition-all shadow-lg shadow-primary/10 hover:scale-[1.02] active:scale-[0.98] self-start"
        >
          <Plus className="w-4 h-4" />
          Buat Metode
        </Link>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-zinc-950/20 p-4 rounded-2xl border border-white/5">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari metode..."
            className="w-full bg-zinc-900/50 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={() => setIsGridView(true)}
            className={`p-2 rounded-lg border transition-all ${
              isGridView 
                ? "bg-zinc-900 border-zinc-700 text-indigo-400" 
                : "bg-transparent border-white/5 text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Grid className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={() => setIsGridView(false)}
            className={`p-2 rounded-lg border transition-all ${
              !isGridView 
                ? "bg-zinc-900 border-zinc-700 text-indigo-400" 
                : "bg-transparent border-white/5 text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <List className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Grid view */}
      {filteredMethods.length > 0 ? (
        isGridView ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMethods.map((m) => {
              const stats = getMethodStats(m);
              return (
                <Link 
                  key={m.id}
                  href={`/methods/${m.id}`}
                  className="glass rounded-2xl border border-white/5 p-6 flex flex-col justify-between hover:border-indigo-500/20 hover:shadow-[0_0_20px_-5px_rgba(99,102,241,0.15)] transition-all group duration-300"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        m.isPublic 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                          : "bg-zinc-800/40 text-zinc-400 border border-zinc-700/30"
                      }`}>
                        {m.isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        {m.isPublic ? "Publik" : "Privat"}
                      </span>
                      <button
                        onClick={(e) => handleDelete(m.id, e)}
                        className="p-1 text-zinc-600 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors line-clamp-1">{m.name}</h3>
                      <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2 min-h-[32px]">{m.description || "Tidak ada deskripsi."}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-zinc-900/60 text-center">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-zinc-500 block uppercase font-medium">Win Rate</span>
                      <span className="text-sm font-bold text-white font-mono">{stats.winRate}%</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-zinc-500 block uppercase font-medium">Profit Factor</span>
                      <span className="text-sm font-bold text-white font-mono">{stats.profitFactor}x</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-zinc-500 block uppercase font-medium">Avg R</span>
                      <span className="text-sm font-bold text-white font-mono">+{stats.avgR}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* List view */
          <div className="glass rounded-2xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-900 text-xs font-semibold text-zinc-400 bg-zinc-950/20">
                    <th className="px-6 py-4">Nama Metode</th>
                    <th className="px-6 py-4">Akses</th>
                    <th className="px-6 py-4">Total Trades</th>
                    <th className="px-6 py-4">Win Rate</th>
                    <th className="px-6 py-4">Profit Factor</th>
                    <th className="px-6 py-4">Rata-rata R</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/60">
                  {filteredMethods.map((m) => {
                    const stats = getMethodStats(m);
                    return (
                      <tr 
                        key={m.id} 
                        className="text-sm text-zinc-300 hover:bg-white/[0.01] transition-colors cursor-pointer"
                        onClick={() => window.location.href = `/methods/${m.id}`}
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold text-white hover:text-primary transition-colors">{m.name}</p>
                            <p className="text-xs text-zinc-500 truncate max-w-[250px] mt-0.5">{m.description || "No description"}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            m.isPublic 
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                              : "bg-zinc-800/40 text-zinc-400 border border-zinc-700/30"
                          }`}>
                            {m.isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                            {m.isPublic ? "Publik" : "Privat"}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono font-medium">{stats.totalTrades}</td>
                        <td className="px-6 py-4 font-mono font-medium text-emerald-400">{stats.winRate}%</td>
                        <td className="px-6 py-4 font-mono font-medium">{stats.profitFactor}x</td>
                        <td className="px-6 py-4 font-mono font-medium text-indigo-400">+{stats.avgR} R</td>
                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/methods/${m.id}`}
                              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                            >
                              <Eye className="w-4.5 h-4.5" />
                            </Link>
                            <button
                              onClick={(e) => handleDelete(m.id, e)}
                              className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <div className="glass rounded-2xl border border-white/5 flex flex-col items-center justify-center py-16 text-center">
          <Layers className="w-16 h-16 text-zinc-700 mb-4 animate-pulse" />
          <h3 className="text-lg font-bold text-white">Belum Ada Metode</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm">
            Definisikan metode teknikal (seperti SMC, ICT, SnR) untuk mengelompokkan strategi trading Anda.
          </p>
          <Link
            href="/methods/new"
            className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
            Mulai Buat Metode
          </Link>
        </div>
      )}
    </div>
  );
}
