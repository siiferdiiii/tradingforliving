"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, FolderPlus, Sparkles } from "lucide-react";
import { DatabaseManager } from "@/lib/mock-data";
import { Method, Strategy, TradingSession } from "@/types";

export default function NewSessionPage() {
  const router = useRouter();
  const [methods, setMethods] = useState<Method[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [filteredStrats, setFilteredStrats] = useState<Strategy[]>([]);
  
  const [name, setName] = useState("");
  const [selectedMethodId, setSelectedMethodId] = useState("");
  const [selectedStrategyId, setSelectedStrategyId] = useState("");
  const [instrument, setInstrument] = useState("EURUSD");
  const [startDate, setStartDate] = useState("2026-05-01");
  const [endDate, setEndDate] = useState("2026-05-31");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const loadedMethods = DatabaseManager.getMethods();
    const loadedStrats = DatabaseManager.getStrategies();
    setMethods(loadedMethods);
    setStrategies(loadedStrats);

    if (loadedMethods.length > 0) {
      setSelectedMethodId(loadedMethods[0].id);
    }
  }, []);

  // Handle cascading dropdown update
  useEffect(() => {
    if (selectedMethodId) {
      const filtered = strategies.filter(s => s.methodId === selectedMethodId);
      setFilteredStrats(filtered);
      if (filtered.length > 0) {
        setSelectedStrategyId(filtered[0].id);
      } else {
        setSelectedStrategyId("");
      }
    }
  }, [selectedMethodId, strategies]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Nama sesi harus diisi");
      return;
    }
    if (!selectedMethodId) {
      setError("Metode teknikal wajib dipilih");
      return;
    }
    if (!selectedStrategyId) {
      setError("Strategi entri wajib dipilih");
      return;
    }
    if (!instrument.trim()) {
      setError("Instrumen (pair) wajib diisi");
      return;
    }

    setIsLoading(true);

    const newSession: TradingSession = {
      id: `sess-${Date.now()}`,
      name,
      date: startDate,
      status: "active",
      startBalance: 10000,
      endBalance: 10000,
      totalTrades: 0,
      winRate: 0,
      netProfit: 0,
      notes: `Sesi backtest ${instrument} menggunakan ${methods.find(m => m.id === selectedMethodId)?.name}.`,
      createdAt: new Date().toISOString()
    };

    setTimeout(() => {
      const currentSessions = DatabaseManager.getSessions();
      DatabaseManager.saveSessions([newSession, ...currentSessions]);
      router.push(`/sessions/${newSession.id}`);
    }, 800);
  };

  if (!isClient) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-up">
      {/* Back Button */}
      <Link
        href="/sessions"
        className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Daftar Sesi
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
          Mulai Sesi Backtest Baru
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Tetapkan pair instrumen, filter strategi, dan rekam performa entri Anda secara terukur.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-semibold">
          {error}
        </div>
      )}

      {methods.length === 0 ? (
        <div className="glass rounded-2xl border border-white/5 p-8 text-center space-y-4">
          <p className="text-sm text-zinc-400">
            Anda harus membuat minimal satu <strong>Metode Teknikal</strong> dan <strong>Strategi</strong> sebelum bisa memulai sesi backtest.
          </p>
          <Link
            href="/methods/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover shadow-lg"
          >
            Buat Metode Pertama Anda
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="glass rounded-2xl border border-white/5 p-8 space-y-6 relative overflow-hidden">
          {/* Decor */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

          {/* Sesi Name */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Nama Sesi Backtest</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Mei 2026 - Forex Scaling Session"
              required
              className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-primary/50 focus:outline-none transition-all placeholder:text-zinc-600"
            />
          </div>

          {/* Method & Strategy Dropdowns (Cascading) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Metode Teknikal</label>
              <select
                value={selectedMethodId}
                onChange={(e) => setSelectedMethodId(e.target.value)}
                className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-primary/50 focus:outline-none transition-all text-zinc-200"
              >
                {methods.map(m => (
                  <option key={m.id} value={m.id} className="bg-zinc-950 text-zinc-200">{m.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Strategi Entri</label>
              <select
                value={selectedStrategyId}
                onChange={(e) => setSelectedStrategyId(e.target.value)}
                disabled={filteredStrats.length === 0}
                className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-primary/50 focus:outline-none transition-all text-zinc-200 disabled:opacity-50"
              >
                {filteredStrats.length > 0 ? (
                  filteredStrats.map(s => (
                    <option key={s.id} value={s.id} className="bg-zinc-950 text-zinc-200">{s.name}</option>
                  ))
                ) : (
                  <option value="" className="bg-zinc-950 text-zinc-500">Belum ada strategi dibuat</option>
                )}
              </select>
              {filteredStrats.length === 0 && selectedMethodId && (
                <p className="text-[10px] text-amber-500 mt-1">
                  * Metode ini belum memiliki strategi. Silakan{" "}
                  <Link href={`/methods/${selectedMethodId}`} className="text-primary hover:underline font-semibold">
                    tambahkan strategi
                  </Link>{" "}
                  terlebih dahulu.
                </p>
              )}
            </div>
          </div>

          {/* Instrument (Pair) */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Instrumen / Pair</label>
            <input
              type="text"
              value={instrument}
              onChange={(e) => setInstrument(e.target.value)}
              placeholder="Contoh: EURUSD, XAUUSD, BTCUSD"
              required
              className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-primary/50 focus:outline-none transition-all placeholder:text-zinc-600"
            />
          </div>

          {/* Period Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Tanggal Mulai Periode</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-primary/50 focus:outline-none transition-all text-zinc-200"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Tanggal Selesai Periode</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-primary/50 focus:outline-none transition-all text-zinc-200"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-zinc-900/60">
            <Link
              href="/sessions"
              className="px-5 py-2.5 rounded-xl border border-white/5 hover:border-zinc-800 bg-zinc-950/40 hover:bg-zinc-900 text-zinc-400 hover:text-white text-xs font-semibold transition-all"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={isLoading || filteredStrats.length === 0}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent-violet hover:from-primary-hover hover:to-primary text-white text-xs font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Mulai Sesi Backtest
                  <Check className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
